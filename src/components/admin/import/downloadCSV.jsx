import { useState } from "react"
import ExcelJS from "exceljs"
import FileUpload from "../import/fileUpload"
import ActionButtons from "../import/actionButtons"
import { uploadToStrapi } from "../import/uploadToStrapi"

const DownloadCSVFile = ({ csvData, setCsvData, setGroupedData }) => {
  const [fileName, setFileName] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState("")
  const [uploadMessage, setUploadMessage] = useState("")
  const [progressLogs, setProgressLogs] = useState([])
  const [summaryMessage, setSummaryMessage] = useState("")
  const [showLogs, setShowLogs] = useState(false)
  const [view, setView] = useState("upload") // "upload", "processing", "results"

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (file) {
      setFileName(file.name)

      const reader = new FileReader()

      reader.onload = async (e) => {
        const workbook = new ExcelJS.Workbook()
        await workbook.xlsx.load(e.target.result)
        const worksheet = workbook.getWorksheet(1)
        const jsonData = []

        worksheet.eachRow((row) => {
          const rowValues = row.values.slice(1)
          jsonData.push(rowValues)
        })

        const formattedData = jsonData.map((row, rowIndex) => {
          if (rowIndex === 0) return row
          return row.map((cell, cellIndex) => {
            if (cellIndex === 0) {
              return cell ? new Date(cell).toLocaleDateString("en-GB") : ""
            }
            if (cellIndex === 1) {
              return cell ? new Date(cell).toLocaleTimeString("en-GB") : ""
            }
            return cell
          })
        })

        setCsvData(formattedData)

        const dataGroups = {}
        for (let i = 1; i < formattedData.length; i++) {
          const row = formattedData[i]
          if (!row || row.length < 3) continue

          const time = row[1]
          if (!time) continue

          if (!dataGroups[time]) {
            dataGroups[time] = []
          }

          const rowData = []
          for (let j = 2; j < row.length; j++) {
            rowData.push(row[j])
          }

          dataGroups[time].push(rowData)
        }

        setGroupedData(dataGroups)
      }

      reader.readAsArrayBuffer(file)
    }
  }

  const downloadCSV = () => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("CSV Data")

    csvData.forEach((row) => worksheet.addRow(row))

    workbook.csv.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${fileName
        .split(".")
        .slice(0, -1)
        .join(".")}-CSV-Conversion.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    })
  }

  const handleUploadToStrapi = async () => {
    try {
      setProgressLogs([])
      setSummaryMessage("")
      setShowLogs(false)
      setView("processing")

      await uploadToStrapi(
        csvData,
        setUploadProgress,
        setUploadStatus,
        setUploadMessage,
        setProgressLogs,
        setSummaryMessage
      )

      setView("results")
    } catch (error) {
      console.error("Upload error:", error)
      setUploadStatus("❌ Error")
      setUploadMessage("Upload failed: " + error.message)
      setView("results")
    }
  }

  const handleReset = () => {
    setView("upload")
    setUploadProgress(0)
  }

  const renderProcessingMessage = () => {
    return (
      <div className="flex items-center justify-center w-full">
        {uploadMessage}
        <svg
          className="ml-3 w-5 h-5 text-[#214A27] animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    )
  }

  const formatSummaryText = (text) => {
    if (!text) return []
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
  }

  const renderUploadView = () => {
    return (
      <>
        <h2 className="text-lg font-semibold text-center mb-4">
          Import Your Excel File
        </h2>

        <FileUpload onFileUpload={handleFileUpload} />
        {fileName && (
          <div>
            {/* Download CSV button */}
            <ActionButtons onDownloadCSV={downloadCSV} />

            <p className="text-gray-700 text-sm mb-2">
              Uploaded File: <strong>{fileName}</strong>
            </p>

            {/* Publish button */}
            <ActionButtons onUploadToStrapi={handleUploadToStrapi} />
          </div>
        )}
      </>
    )
  }

  const renderProcessingView = () => {
    return (
      <div className="py-8 text-center">
        <h2 className="text-xl font-semibold mb-6">Processing Your Data</h2>

        {renderProcessingMessage()}

        {uploadProgress > 0 && (
          <div className="w-full bg-[#D9D9D9] rounded-full h-2.5 mt-6 max-w-md mx-auto">
            <div
              className="bg-[#214A27] h-2.5 rounded-full"
              style={{ width: `${uploadProgress}%` }}></div>
          </div>
        )}
      </div>
    )
  }

  const renderResultsView = () => {
    return (
      <div className="py-4">
        <div className="text-center">
          <div className="font-semibold text-xl mb-4">{uploadStatus}</div>

          {/* Show success/error message */}
          <div className="mb-6">
            {uploadMessage.split("||").map((line, index) => (
              <div key={index}>{line}</div>
            ))}
          </div>

          {/* Summary message box */}
          {summaryMessage && (
            <div className="mt-4 bg-[#214A27] p-4 rounded-md font-mono text-sm overflow-x-auto border border-gray-300 shadow-sm max-w-2xl mx-auto">
              {formatSummaryText(summaryMessage).map((line, index) => {
                const isHeaderOrFooter = line.includes("====")
                const isLabelValue = line.includes(":")

                if (isHeaderOrFooter) {
                  return (
                    <div key={index} className="text-white font-bold">
                      {line}
                    </div>
                  )
                } else if (isLabelValue) {
                  const [label, value] = line.split(":").map((s) => s.trim())
                  return (
                    <div key={index} className="flex justify-between">
                      <span className="text-white font-medium">{label}:</span>
                      <span className="text-[#D9D9D9] font-semibold">
                        {value}
                      </span>
                    </div>
                  )
                } else {
                  return (
                    <div key={index} className="text-gray-800">
                      {line}
                    </div>
                  )
                }
              })}
            </div>
          )}

          {/* Log toggle button */}
          {progressLogs.length > 0 && (
            <div className="mt-5">
              <button
                onClick={() => setShowLogs(!showLogs)}
                className="text-[#214A27] underline font-semibold">
                {showLogs ? "Hide All Logs" : "Show All Logs"}
              </button>
            </div>
          )}

          {/* Display logs if enabled */}
          {showLogs && progressLogs.length > 0 && (
            <div className="mt-4 bg-[#D9D9D9] p-4 rounded-md overflow-y-auto max-h-80 max-w-4xl mx-auto">
              {progressLogs.map((log, index) => (
                <div key={index} className="text-sm border-b pb-1 mb-1 flex">
                  <span className="mr-2 w-6">{log.status}</span>
                  <div>
                    <span className="font-medium">{log.message}</span>
                    {log.detail && (
                      <span className="text-[#214A27] ml-2">{log.detail}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Back button */}
          <div className="mt-8">
            <button
              onClick={handleReset}
              className="bg-[#214A27] hover:bg-[#1a3e20] text-white px-4 py-2 rounded">
              Upload Another File
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-4 bg-white h-full p-6 rounded-lg shadow-lg">
      {view === "upload" && renderUploadView()}
      {view === "processing" && renderProcessingView()}
      {view === "results" && renderResultsView()}
    </div>
  )
}

export default DownloadCSVFile
