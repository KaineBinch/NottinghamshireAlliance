import { useState } from "react"
import axios from "axios"
import { queryBuilder } from "../../../utils/queryBuilder"
import { MODELS, QUERIES } from "../../../constants/api"

export const uploadToStrapi = async (
  csvData,
  setUploadProgress,
  setUploadStatus,
  setUploadMessage,
  setProgressLogs,
  setSummaryMessage
) => {
  const userConfirmed = window.confirm(
    "Are you sure you want to make these changes? Your changes cannot be undone."
  )
  if (!userConfirmed) {
    setUploadStatus("Cancelled")
    setUploadMessage("Upload cancelled by user. ❌")
    return
  }

  try {
    setUploadStatus("Uploading")
    setUploadMessage("Processing...")

    if (setProgressLogs) {
      setProgressLogs([])
    }

    const blob = csvData.map((row) => row.join(",")).join("\n")
    const body = { blob }

    const query = queryBuilder(MODELS.imports, QUERIES.csvImport)
    const response = await axios.post(query, body, {
      headers: { "Content-Type": "application/JSON" },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
        setUploadProgress(progress)
        setUploadMessage("Processing...")
      },
    })

    if (response.status === 200) {
      console.log("Upload successful ✅")
      setUploadStatus("Success! ✅")

      if (response.data.progressLogs && setProgressLogs) {
        setProgressLogs(response.data.progressLogs)
      } else if (response.data.logs) {
        setProgressLogs(response.data.logs)
      }

      const executionTime =
        response.data.executionTimeSeconds ||
        response.data.executionTime ||
        "N/A"
      const messageLines = [
        `Upload Successful!`,
        `Processed ${response.data.attempted} rows in ${executionTime} seconds.`,
        `Created ${response.data.created} entries.`,
      ]

      if (response.data.updated) {
        messageLines.push(`Updated ${response.data.updated} entries.`)
      }

      if (response.data.failed > 0) {
        messageLines.push(`Failed entries: ${response.data.failed}`)
      }

      messageLines.push(
        `The data has been successfully imported to the database.`
      )

      setUploadMessage(messageLines.join("||"))

      if (setSummaryMessage) {
        const summaryText =
          response.data.summaryText ||
          `==== Import Process Summary ====
Total time: ${executionTime} seconds
Total rows processed: ${response.data.attempted || 0}
Entries created: ${response.data.created || 0}
Entries updated: ${response.data.updated || 0}
Failed entries: ${response.data.failed || 0}
===============================`

        setSummaryMessage(summaryText)
      }

      return response.data
    } else {
      setUploadStatus("❌ Error")
      setUploadMessage(`🚩 Upload failed with status: ${response.status}`)
      throw new Error(`🚩 Upload failed with status: ${response.status}`)
    }
  } catch (error) {
    console.error("🚩 Error uploading CSV to Strapi:", error)
    setUploadStatus("❌ Error")

    if (error.response?.data?.progressLogs && setProgressLogs) {
      setProgressLogs(error.response.data.progressLogs)
    } else if (error.response?.data?.logs) {
      setProgressLogs(error.response.data.logs)
    }

    setUploadMessage(
      `🚩 Upload failed: ${
        error.response?.data?.error?.message || error.message
      }`
    )
  }
}

export const CSVUploader = ({ initialData = [] }) => {
  const [csvData] = useState(initialData)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState("")
  const [uploadMessage, setUploadMessage] = useState("")
  const [progressLogs, setProgressLogs] = useState([])
  const [summaryMessage, setSummaryMessage] = useState("")
  const [showLogs, setShowLogs] = useState(false)
  const [importStats, setImportStats] = useState(null)

  const handleUpload = async () => {
    if (csvData.length === 0) {
      alert("Please select a file first")
      return
    }

    setShowLogs(false)
    setImportStats(null)
    setSummaryMessage("")

    const response = await uploadToStrapi(
      csvData,
      setUploadProgress,
      setUploadStatus,
      setUploadMessage,
      setProgressLogs,
      setSummaryMessage
    )

    if (response) {
      setImportStats({
        executionTime:
          response.executionTimeSeconds || response.executionTime || "N/A",
        rowsProcessed: response.attempted || 0,
        entriesCreated: response.created || 0,
      })
    }
  }

  const renderProcessingState = () => {
    if (uploadStatus === "Uploading") {
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
    return uploadMessage
  }

  return (
    <div className="p-4">
      {/* File upload UI here */}

      <button
        onClick={handleUpload}
        className="bg-[#214A27] hover:bg-[#1a3e20] text-white px-4 py-2 rounded">
        Upload to Strapi
      </button>

      {uploadStatus && (
        <div className="mt-4 p-4 bg-white shadow-md rounded-lg">
          <div className="font-semibold text-xl mb-2 text-center">
            {uploadStatus}
          </div>

          {/* Render upload message with spinner for uploading state */}
          <div className="text-center">{renderProcessingState()}</div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div
                className="bg-[#214A27] h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}></div>
            </div>
          )}

          {/* Format the summary message with the nice styling */}
          {summaryMessage && (
            <div className="mt-4 bg-[#214A27] p-4 rounded-md font-mono text-sm overflow-x-auto border border-gray-300 shadow-sm">
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

          {importStats && (
            <div className="mt-4 bg-[#f0f4f0] p-3 rounded-md border border-[#d2e0d2]">
              <h3 className="font-medium text-[#214A27]">Import Statistics</h3>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div className="text-center p-2 bg-white rounded shadow-sm border border-gray-200">
                  <div className="text-lg font-bold text-[#214A27]">
                    {importStats.executionTime}s
                  </div>
                  <div className="text-sm text-gray-600">Total Time</div>
                </div>
                <div className="text-center p-2 bg-white rounded shadow-sm border border-gray-200">
                  <div className="text-lg font-bold text-[#214A27]">
                    {importStats.rowsProcessed}
                  </div>
                  <div className="text-sm text-gray-600">Rows Processed</div>
                </div>
                <div className="text-center p-2 bg-white rounded shadow-sm border border-gray-200">
                  <div className="text-lg font-bold text-[#214A27]">
                    {importStats.entriesCreated}
                  </div>
                  <div className="text-sm text-gray-600">Entries Created</div>
                </div>
              </div>
            </div>
          )}

          {/* Only show the logs button if there are logs to show */}
          {progressLogs.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setShowLogs(!showLogs)}
                className="text-[#214A27] hover:text-[#183a1f] underline text-sm">
                {showLogs ? "Hide Detailed Logs" : "Show Detailed Logs"}
              </button>
            </div>
          )}
        </div>
      )}
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
