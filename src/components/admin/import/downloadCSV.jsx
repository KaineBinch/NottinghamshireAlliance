import { useState } from "react"
import ExcelJS from "exceljs"
import FileUpload from "../import/fileUpload"
import ActionButtons from "../import/actionButtons"
import { uploadToStrapi } from "../import/uploadToStrapi"
import { useAuth0 } from "@auth0/auth0-react"

const DownloadCSVFile = ({ csvData, setCsvData, setGroupedData }) => {
  const { getAccessTokenSilently, isAuthenticated, loginWithRedirect } =
    useAuth0()
  const [fileName, setFileName] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState("")
  const [uploadMessage, setUploadMessage] = useState("")

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

        // Extract data from Excel
        worksheet.eachRow((row) => {
          const rowValues = row.values.slice(1)
          jsonData.push(rowValues)
        })

        // Format dates in the data
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

        // Set the CSV data
        setCsvData(formattedData)

        // Create data groups
        const dataGroups = {}
        for (let i = 1; i < formattedData.length; i++) {
          const row = formattedData[i]
          if (!row || row.length < 3) continue

          const time = row[1]
          if (!time) continue

          if (!dataGroups[time]) {
            dataGroups[time] = []
          }

          // Include ALL columns after the time column
          const rowData = []
          for (let j = 2; j < row.length; j++) {
            rowData.push(row[j])
          }

          dataGroups[time].push(rowData)
        }

        setGroupedData(dataGroups)

        console.log("Headers:", formattedData[0])
        console.log("Sample Data:", formattedData[1])
        console.log("Grouped Data Sample:", Object.values(dataGroups)[0])
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
      if (!isAuthenticated) {
        setUploadStatus("❌ Auth Error")
        setUploadMessage("You need to log in first")

        await loginWithRedirect()
        return
      }

      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: "https://alliance-admin.uk.auth0.com/api/v2/",
          scope: "openid profile email",
        },
      })

      await uploadToStrapi(
        csvData,
        setUploadProgress,
        setUploadStatus,
        setUploadMessage,
        token
      )
    } catch (error) {
      console.error("Auth error details:", error)
      setUploadStatus("❌ Auth Error")
      setUploadMessage("Authentication failed: " + error.message)
    }
  }

  return (
    <div className="flex flex-col space-y-4 bg-gray-100 h-full p-6 rounded-lg shadow-lg">
      <h2 className="text-lg font-semibold text-center mb-4">
        Import Your Excel File
      </h2>

      <FileUpload onFileUpload={handleFileUpload} />
      {fileName && (
        <div>
          {/* Only shows "Download CSV" */}
          <ActionButtons onDownloadCSV={downloadCSV} />

          <p className="text-gray-700 text-sm mb-2">
            Uploaded File: <strong>{fileName}</strong>
          </p>

          {/* Only shows "Publish" */}
          <ActionButtons onUploadToStrapi={handleUploadToStrapi} />
        </div>
      )}
      {uploadStatus && (
        <div className="mt-4">
          <div>Status: {uploadStatus}</div>
          <div>Message: {uploadMessage}</div>
          {uploadStatus === "uploading" && <p>Progress: {uploadProgress}%</p>}
        </div>
      )}
    </div>
  )
}

export default DownloadCSVFile
