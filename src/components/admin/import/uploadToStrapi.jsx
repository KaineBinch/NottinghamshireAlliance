import { useState } from "react"
import axios from "axios"
import { queryBuilder } from "../../../utils/queryBuilder"
import { MODELS, QUERIES } from "../../../constants/api"
import Spinner from "../../helpers/spinner"

const formatLogSummary = (originalSummary) => {
  if (!originalSummary) return originalSummary

  let lines = originalSummary.split("\n")
  let totalGolfersProcessed = "0"

  for (const line of lines) {
    if (line.includes("For a total of") && line.includes("golfers processed")) {
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

export const uploadToStrapi = async (
  csvData,
  eventReview = "",
  setUploadProgress,
  setUploadStatus,
  setUploadMessage,
  setProgressLogs,
  setSummaryMessage,
  setErrorLogs = null
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

    if (setErrorLogs) {
      setErrorLogs([])
    }

    const blob = csvData.map((row) => row.join(",")).join("\n")
    const body = { blob, eventReview }

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

      clearCachesAfterPublish()

      if (response.data.logs && setProgressLogs) {
        const logTypeIcons = {
          info: "ℹ️",
          success: "✅",
          warning: "⚠️",
          error: "❌",
          timing: "⏱️",
        }

        const formattedLogs = response.data.logs.map((log) => {
          const newLog = { ...log }

          if (
            newLog.message &&
            newLog.message.includes("==== IMPORT PROCESS SUMMARY ====")
          ) {
            newLog.message = formatLogSummary(newLog.message)
          }

          return {
            status: logTypeIcons[newLog.type] || "•",
            message: newLog.message,
            detail: newLog.detail,
            type: newLog.type,
            timestamp: newLog.timestamp,
          }
        })

        setProgressLogs(formattedLogs)

        if (setErrorLogs) {
          const errors = formattedLogs.filter(
            (log) => log.type === "error" || log.type === "warning"
          )
          setErrorLogs(errors)
        }

        if (setSummaryMessage) {
          const summaryLog = formattedLogs.find(
            (log) =>
              log.message &&
              log.message.includes("==== IMPORT PROCESS SUMMARY ====")
          )

          if (summaryLog) {
            setSummaryMessage(summaryLog.message)
          }
        }
      }

      const created = response.data.created || {}
      const totalCreated =
        typeof created === "object"
          ? (created.golfers || 0) +
            (created.teeTimes || 0) +
            (created.scores || 0)
          : created || 0

      const errorCount = response.data.logs
        ? response.data.logs.filter((log) => log.type === "error").length
        : 0
      const warningCount = response.data.logs
        ? response.data.logs.filter((log) => log.type === "warning").length
        : 0

      let statusLabel = "Upload Successful!"
      if (errorCount > 0 || warningCount > 0) {
        statusLabel = "Upload Completed with Issues"
      }

      const messageLines = [
        statusLabel,
        `Processed ${response.data.attempted || 0} rows in ${
          response.data.executionTimeSeconds || "N/A"
        } seconds.`,
      ]

      if (typeof created === "object") {
        messageLines.push(
          `Created ${created.golfers || 0} golfers, ${
            created.teeTimes || 0
          } tee times, and ${created.scores || 0} scores.`
        )
      } else {
        messageLines.push(`Created ${totalCreated} entries.`)
      }

      if (response.data.updated) {
        messageLines.push(`Updated ${response.data.updated} entries.`)
      }

      if (response.data.failed > 0) {
        messageLines.push(`Failed entries: ${response.data.failed}`)
      }

      if (errorCount > 0 || warningCount > 0) {
        messageLines.push(
          `Import completed with ${errorCount} errors and ${warningCount} warnings.`
        )
      } else {
        messageLines.push(
          `The data has been successfully imported to the database.`
        )
      }

      setUploadMessage(messageLines.join("||"))

      if (setSummaryMessage) {
        const summaryLogFound =
          response.data.logs &&
          response.data.logs.some(
            (log) =>
              log.message &&
              log.message.includes("==== IMPORT PROCESS SUMMARY ====")
          )

        if (!summaryLogFound && !response.data.summaryText) {
          const eventDates = response.data.eventDates || "Not specified"
          const processedTimeSlots = response.data.processedTimeSlots || 0
          const processedGolfers = response.data.processedGolfers || 0

          let formattedEventDates = eventDates
          if (
            typeof eventDates === "string" &&
            eventDates.match(/^\d{4}-\d{2}-\d{2}$/)
          ) {
            const [year, month, day] = eventDates.split("-")
            formattedEventDates = `${day}/${month}/${year}`
          } else if (Array.isArray(eventDates)) {
            formattedEventDates = eventDates
              .map((date) => {
                if (
                  typeof date === "string" &&
                  date.match(/^\d{4}-\d{2}-\d{2}$/)
                ) {
                  const [year, month, day] = date.split("-")
                  return `${day}/${month}/${year}`
                }
                return date
              })
              .join(", ")
          }

          let summaryText = `==== IMPORT PROCESS SUMMARY ====
Import completed in ${response.data.executionTimeSeconds || "N/A"} seconds

Event Information:
- Date(s): ${formattedEventDates}
- Total tee time slots: ${processedTimeSlots}

Records Processed:
- ${processedGolfers} golfers updated
- ${
            typeof created === "object" ? created.teeTimes || 0 : 0
          } tee time assignments
- ${typeof created === "object" ? created.scores || 0 : 0} score entries
`

          if (errorCount > 0 || warningCount > 0) {
            summaryText += `
Issues Found:
- ${errorCount} errors
- ${warningCount} warnings
`
          }

          summaryText += `===============================`

          setSummaryMessage(summaryText)
        } else if (!summaryLogFound && response.data.summaryText) {
          setSummaryMessage(formatLogSummary(response.data.summaryText))
        }
      }

      return {
        ...response.data,
        created: totalCreated,
        executionTimeSeconds: response.data.executionTimeSeconds,
        attempted: response.data.attempted,
      }
    } else {
      setUploadStatus("❌ Error")
      setUploadMessage(`🚩 Upload failed with status: ${response.status}`)
      throw new Error(`🚩 Upload failed with status: ${response.status}`)
    }
  } catch (error) {
    console.error("🚩 Error uploading CSV to Strapi:", error)
    setUploadStatus("❌ Error")

    if (error.response?.data?.logs && setProgressLogs) {
      const logTypeIcons = {
        info: "ℹ️",
        success: "✅",
        warning: "⚠️",
        error: "❌",
        timing: "⏱️",
      }

      const formattedLogs = error.response.data.logs.map((log) => {
        const newLog = { ...log }

        if (
          newLog.message &&
          newLog.message.includes("==== IMPORT PROCESS SUMMARY ====")
        ) {
          newLog.message = formatLogSummary(newLog.message)
        }

        return {
          status: logTypeIcons[newLog.type] || "•",
          message: newLog.message,
          detail: newLog.detail,
          type: newLog.type,
          timestamp: newLog.timestamp,
        }
      })

      setProgressLogs(formattedLogs)

      if (setErrorLogs) {
        const errors = formattedLogs.filter(
          (log) => log.type === "error" || log.type === "warning"
        )
        setErrorLogs(errors)
      }
    }

    setUploadMessage(
      `🚩 Upload failed: ${
        error.response?.data?.error?.message || error.message
      }`
    )
  }
}

function clearCachesAfterPublish() {
  try {
    // Use a more aggressive approach to clear all API caches

    // 1. Clear React Query cache by forcing a window reload on the current page
    // This is the most reliable way to clear all in-memory caches
    if (window.location.pathname.includes("/admin")) {
      console.log("Admin page detected - skipping immediate reload")
    } else {
      window.location.reload()
      return // Stop execution as we're reloading anyway
    }

    // 2. For all other tabs, broadcast a refresh message with a timestamp
    localStorage.setItem("refresh_trigger", Date.now().toString())

    // 3. Explicitly clear localStorage cache with a more thorough pattern matching
    // This finds and clears all API cache entries
    const cacheKeys = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      // Match any key related to our API cache
      if (
        key &&
        (key.startsWith("notts_alliance_api_cache_") || key.includes("/api/"))
      ) {
        localStorage.removeItem(key)
        cacheKeys.push(key)
      }
    }

    console.log(`Cleared ${cacheKeys.length} cache entries:`, cacheKeys)

    // 4. If we're in development mode, output more detailed logs
    if (import.meta.env.DEV) {
      console.log("Cache cleared in development mode")
      console.log("Remaining localStorage items:", Object.keys(localStorage))
    }
  } catch (e) {
    console.warn("Error clearing caches:", e)
  }
}

export const CSVUploader = ({ initialData = [] }) => {
  const [csvData] = useState(initialData)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState("")
  const [uploadMessage, setUploadMessage] = useState("")
  const [progressLogs, setProgressLogs] = useState([])
  const [errorLogs, setErrorLogs] = useState([])
  const [summaryMessage, setSummaryMessage] = useState("")
  const [showLogs, setShowLogs] = useState(false)

  const handleUpload = async () => {
    if (csvData.length === 0) {
      alert("Please select a file first")
      return
    }

    setShowLogs(false)
    setSummaryMessage("")
    setErrorLogs([])

    await uploadToStrapi(
      csvData,
      setUploadProgress,
      setUploadStatus,
      setUploadMessage,
      setProgressLogs,
      setSummaryMessage,
      setErrorLogs
    )
  }

  const renderProcessingState = () => {
    if (uploadStatus === "Uploading") {
      return (
        <div className="flex items-center justify-center w-full">
          {uploadMessage}
          <Spinner size="md" color="#214A27" />
        </div>
      )
    }
    return uploadMessage
  }

  const formatSummaryText = (text) => {
    if (!text) return []
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
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

          {/* Error/Warning counts if any */}
          {errorLogs.length > 0 && (
            <div className="mt-4 mb-2 text-center">
              <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                {errorLogs.filter((log) => log.type === "error").length} Errors
                / {errorLogs.filter((log) => log.type === "warning").length}{" "}
                Warnings
              </span>
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
                      <span className="text-white font-semibold">{value}</span>
                    </div>
                  )
                } else {
                  return (
                    <div key={index} className="text-white">
                      {line}
                    </div>
                  )
                }
              })}
            </div>
          )}

          {/* Only show the logs button if there are logs to show */}
          <div className="mt-4 flex justify-center space-x-4">
            {progressLogs.length > 0 && (
              <button
                onClick={() => setShowLogs(!showLogs)}
                className="text-[#214A27] hover:text-[#183a1f] underline text-sm">
                {showLogs ? "Hide Detailed Logs" : "Show Detailed Logs"}
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
            <div className="mt-4 bg-[#D9D9D9] p-4 rounded-md overflow-y-auto max-h-80">
              {progressLogs.map((log, index) => {
                const isSectionHeader = log.message?.includes("===")
                const isError = log.type === "error"
                const isWarning = log.type === "warning"

                return (
                  <div
                    key={index}
                    className={`text-sm border-b border-[#396847] pb-1 mb-1 flex ${
                      isError
                        ? "text-red-600"
                        : isWarning
                        ? "text-yellow-700"
                        : "text-gray-800"
                    } ${isSectionHeader ? "font-semibold" : ""}`}>
                    <div className="mr-2 w-6 text-center">{log.status}</div>
                    <div className="flex-1">
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
        </div>
      )}
    </div>
  )
}
