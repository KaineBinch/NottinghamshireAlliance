import { useState } from "react"
import ExcelJS from "exceljs"
import FileUpload from "../import/fileUpload"
import ActionButtons from "../import/actionButtons"
import { uploadToStrapi } from "../import/uploadToStrapi"
import Spinner from "../../helpers/spinner"
import EventReviewInput from "./eventReviewInput"

const DownloadCSVFile = ({ csvData, setCsvData, setGroupedData }) => {
  const [fileName, setFileName] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState("")
  const [uploadMessage, setUploadMessage] = useState("")
  const [progressLogs, setProgressLogs] = useState([])
  const [summaryMessage, setSummaryMessage] = useState("")
  const [showLogs, setShowLogs] = useState(false)
  const [fileInputKey, setFileInputKey] = useState(Date.now())
  const [view, setView] = useState("upload")
  const [errorLogs, setErrorLogs] = useState([])
  const [eventReview, setEventReview] = useState("")

  const handleEventReviewChange = (review) => {
    setEventReview(review)
  }

  const formatLogSummary = (originalSummary) => {
    if (!originalSummary) return originalSummary

    let lines = originalSummary.split("\n")

    let totalGolfersProcessed = "0"
    for (const line of lines) {
      if (
        line.includes("For a total of") &&
        line.includes("golfers processed")
      ) {
        const match = line.match(/For a total of (\d+) golfers processed/)
        if (match && match[1]) {
          totalGolfersProcessed = match[1]
        }
        break
      }
    }

    const modifiedLines = lines.map((line) => {
      if (line.includes("new golfer records")) {
        return `- ${totalGolfersProcessed} golfers updated`
      } else if (line.includes("Date(s):")) {
        const dateMatch = line.match(/Date\(s\):\s*(\d{4}-\d{2}-\d{2})/)
        if (dateMatch && dateMatch[1]) {
          const isoDate = dateMatch[1]
          const [year, month, day] = isoDate.split("-")
          const formattedDate = `${day}/${month}/${year}`
          return line.replace(isoDate, formattedDate)
        }
      } else if (line.includes("Records Created:")) {
        return line.replace("Records Created:", "Records Processed:")
      }
      return line
    })
    return modifiedLines
      .filter((line) => !line.includes("For a total of"))
      .join("\n")
  }

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
          if (rowIndex === 0)
            return row.map((cell) => safelyExtractCellValue(cell))
          return row.map((cell, cellIndex) => {
            const cellValue = safelyExtractCellValue(cell)

            if (cellIndex === 0) {
              return cellValue && !isNaN(new Date(cellValue))
                ? new Date(cellValue).toLocaleDateString("en-GB")
                : cellValue || ""
            }
            if (cellIndex === 1) {
              return cellValue && !isNaN(new Date(cellValue))
                ? new Date(cellValue).toLocaleTimeString("en-GB")
                : cellValue || ""
            }
            return cellValue
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

  const safelyExtractCellValue = (cell) => {
    if (cell === null || cell === undefined) {
      return ""
    }

    if (
      typeof cell === "string" ||
      typeof cell === "number" ||
      typeof cell === "boolean"
    ) {
      return cell
    }

    if (typeof cell === "object") {
      if (cell.formula || cell.sharedFormula) {
        return cell.result !== undefined ? cell.result : ""
      }

      if (cell.richText) {
        return cell.richText.map((rt) => rt.text).join("")
      }

      if (cell.value !== undefined) {
        return safelyExtractCellValue(cell.value)
      }

      if (cell.text && typeof cell.text === "string") {
        return cell.text
      }
    }

    try {
      return String(cell)
    } catch (e) {
      return ""
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
      setErrorLogs([])
      setSummaryMessage("")
      setShowLogs(false)
      setView("processing")

      await uploadToStrapi(
        csvData,
        eventReview, // Pass the event review text
        setUploadProgress,
        setUploadStatus,
        setUploadMessage,
        setProgressLogs,
        setSummaryMessage,
        setErrorLogs
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
    setFileName("")
    setCsvData([])
    setGroupedData({})
    setProgressLogs([])
    setErrorLogs([])
    setSummaryMessage("")
    setFileInputKey(Date.now())
  }

  const renderProcessingMessage = () => {
    return (
      <div className="flex items-center justify-center w-full">
        {uploadMessage}
        <Spinner size="md" color="#214A27" />
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

        <FileUpload
          onFileUpload={handleFileUpload}
          key={fileInputKey}
          resetFileName={!fileName}
        />

        {fileName && (
          <div className="mt-4">
            <EventReviewInput
              onReviewChange={handleEventReviewChange}
              disabled={view === "processing" || view === "results"}
            />
          </div>
        )}

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
    let summaryFromLogs = ""

    if (progressLogs.length > 0) {
      for (const log of progressLogs) {
        if (
          log.message &&
          log.message.includes("==== IMPORT PROCESS SUMMARY ====")
        ) {
          summaryFromLogs = formatLogSummary(log.message)
          break
        }
      }
    }

    const displaySummary = summaryFromLogs || summaryMessage

    const errorCount = errorLogs.filter((log) => log.type === "error").length
    const warningCount = errorLogs.filter(
      (log) => log.type === "warning"
    ).length

    return (
      <div className="py-4">
        <div className="text-center">
          <div className="font-semibold text-xl mb-4">{uploadStatus}</div>

          {/* Success message removed - only show error messages */}
          {!uploadStatus.includes("Success") && (
            <div className="mb-6">
              {uploadMessage.split("||").map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </div>
          )}

          {/* Error/Warning counts if any */}
          {(errorCount > 0 || warningCount > 0) && (
            <div className="mt-4 mb-2">
              {errorCount > 0 && (
                <span className="inline-block mx-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                  {errorCount} {errorCount === 1 ? "Error" : "Errors"}
                </span>
              )}
              {warningCount > 0 && (
                <span className="inline-block mx-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                  {warningCount} {warningCount === 1 ? "Warning" : "Warnings"}
                </span>
              )}
            </div>
          )}

          {/* Summary message box - using displaySummary instead of summaryMessage */}
          {displaySummary && (
            <div className="mt-4 bg-[#214A27] p-4 rounded-md font-mono text-sm overflow-x-auto border border-gray-300 shadow-sm max-w-2xl mx-auto">
              {formatSummaryText(displaySummary).map((line, index) => {
                const isHeaderOrFooter = line.includes("====")
                const isLabelValue = line.includes(":")

                if (isHeaderOrFooter) {
                  return (
                    <div
                      key={index}
                      className="text-white font-bold text-center">
                      {line}
                    </div>
                  )
                } else if (isLabelValue) {
                  const [label, value] = line.split(":").map((s) => s.trim())
                  return (
                    <div key={index} className="flex justify-between text-left">
                      <span className="text-white font-medium">{label}:</span>
                      <span className="text-white font-semibold">{value}</span>
                    </div>
                  )
                } else {
                  return (
                    <div key={index} className="text-white text-left">
                      {line}
                    </div>
                  )
                }
              })}
            </div>
          )}

          {/* Log toggle buttons */}
          <div className="mt-5 space-x-4">
            {progressLogs.length > 0 && (
              <button
                onClick={() => setShowLogs(!showLogs)}
                className="text-[#214A27] underline font-semibold">
                {showLogs ? "Hide All Logs" : "Show All Logs"}
              </button>
            )}
            {errorLogs.length > 0 && (
              <button
                onClick={() => setShowLogs(true)}
                className="text-red-600 hover:text-red-800 underline text-sm">
                View Issues ({errorLogs.length})
              </button>
            )}
          </div>

          {/* Display logs if enabled */}
          {showLogs && progressLogs.length > 0 && (
            <div className="mt-4 bg-[#D9D9D9] p-4 rounded-md overflow-y-auto max-h-80 max-w-4xl mx-auto">
              {progressLogs.map((log, index) => {
                const isSectionHeader = log.message?.includes("===")
                const isError = log.type === "error"
                const isWarning = log.type === "warning"

                return (
                  <div
                    key={index}
                    className={`text-sm border-b border-[#396847] pb-1 mb-1 flex text-gray-800 ${
                      isSectionHeader ? "font-semibold" : ""
                    }`}>
                    {/* Add status/icon display back */}
                    <div className="mr-2 w-6 text-center">
                      {isError && <span className="text-red-500">❌</span>}
                      {isWarning && <span className="text-yellow-500">⚠️</span>}
                      {!isError && !isWarning && log.status && (
                        <span>{log.status}</span>
                      )}
                    </div>
                    <div
                      className={`flex-1 ${isError ? "text-red-600" : ""} ${
                        isWarning ? "text-yellow-700" : ""
                      }`}>
                      <span className={isSectionHeader ? "font-semibold" : ""}>
                        {log.message}
                      </span>
                      {log.detail && (
                        <span className="ml-2 text-[#214A27] text-xs">
                          {log.detail}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
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
