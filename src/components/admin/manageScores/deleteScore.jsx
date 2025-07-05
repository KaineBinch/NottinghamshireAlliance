import { useState, useEffect } from "react"
import {
  getAllScores,
  getScoreById,
  deleteScore,
  checkScoreDeletionSafety,
} from "../../../utils/api/scoresApi"

const DeleteScore = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState("select") // "select", "confirm", or "deleting"
  const [scores, setScores] = useState([])
  const [selectedScore, setSelectedScore] = useState(null)
  const [safetyCheck, setSafetyCheck] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")
  const [confirmText, setConfirmText] = useState("")
  const [expandedEvents, setExpandedEvents] = useState({}) // Track which events are expanded

  // Load all scores on component mount
  useEffect(() => {
    const loadScores = async () => {
      setIsLoading(true)
      try {
        const scoresData = await getAllScores()
        // Sort scores by golfer name, then by event date
        const sortedScores = scoresData.sort((a, b) => {
          const nameA = (a.golfer?.golferName || "").toLowerCase()
          const nameB = (b.golfer?.golferName || "").toLowerCase()
          if (nameA !== nameB) {
            return nameA.localeCompare(nameB)
          }
          // If same golfer, sort by event date
          const dateA = new Date(a.event?.eventDate || 0)
          const dateB = new Date(b.event?.eventDate || 0)
          return dateB - dateA // Most recent first
        })
        setScores(sortedScores)
      } catch (error) {
        console.error("Error loading scores:", error)
        setSubmitMessage("❌ Error loading scores")
      } finally {
        setIsLoading(false)
      }
    }
    loadScores()
  }, [])

  const handleScoreSelect = async (scoreId) => {
    if (!scoreId) return

    setIsLoading(true)
    try {
      // Load score details and safety check in parallel
      const [scoreData, safetyData] = await Promise.all([
        getScoreById(scoreId),
        checkScoreDeletionSafety(scoreId),
      ])

      setSelectedScore(scoreData)
      setSafetyCheck(safetyData)
      setStep("confirm")
    } catch (error) {
      console.error("Error loading score details:", error)
      setSubmitMessage("❌ Error loading score details")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleEventExpansion = (eventKey) => {
    setExpandedEvents((prev) => ({
      ...prev,
      [eventKey]: !prev[eventKey],
    }))
  }

  const handleDelete = async () => {
    if (confirmText.toLowerCase() !== "delete") {
      setSubmitMessage("❌ Please type 'DELETE' to confirm deletion")
      return
    }

    if (!safetyCheck?.canDelete) {
      setSubmitMessage(
        "❌ This score cannot be deleted due to safety restrictions"
      )
      return
    }

    // Final confirmation alert
    const finalConfirmation = window.confirm(
      `⚠️ FINAL CONFIRMATION ⚠️\n\nAre you absolutely sure you want to permanently delete the score for "${
        selectedScore?.golfer?.golferName
      }" in "${selectedScore?.event?.eventType}"?\n\nScore: ${
        selectedScore?.golferEventScore
      }\nEvent Date: ${
        selectedScore?.event?.eventDate
          ? new Date(selectedScore.event.eventDate).toLocaleDateString("en-GB")
          : "Unknown"
      }\n\nThis action cannot be undone and will remove the score from all records.\n\nClick OK to proceed with deletion, or Cancel to abort.`
    )

    if (!finalConfirmation) {
      setSubmitMessage("❌ Deletion cancelled by user")
      return
    }

    setIsDeleting(true)
    setSubmitMessage("")

    try {
      const result = await deleteScore(
        selectedScore.id || selectedScore.documentId
      )

      console.log("Score deleted successfully:", result)
      setSubmitMessage("✅ Score deleted successfully!")

      // Call parent success handler
      if (onSuccess) {
        onSuccess(result)
      }
    } catch (error) {
      console.error("Error deleting score:", error)

      if (error.blockers || error.warnings) {
        const blockerText = error.blockers?.join("; ") || ""
        const warningText = error.warnings?.join("; ") || ""
        setSubmitMessage(
          `❌ Cannot delete score: ${blockerText} ${warningText}`.trim()
        )
      } else {
        setSubmitMessage("❌ Failed to delete score. Please try again.")
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const handleBack = () => {
    setStep("select")
    setSelectedScore(null)
    setSafetyCheck(null)
    setSubmitMessage("")
    setConfirmText("")
    setExpandedEvents({}) // Reset expanded events
  }

  const handleCancel = () => {
    if (onClose) {
      onClose()
    }
  }

  // Selection step
  if (step === "select") {
    return (
      <div className="space-y-4 bg-gray-100 p-6 rounded-lg shadow-lg border border-gray-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-800">
            Select Score to Delete
          </h3>
        </div>

        {/* Show submit message */}
        {submitMessage && (
          <div className="bg-red-100 text-red-700 border border-red-300 rounded p-3 mb-4">
            <div className="font-medium">{submitMessage}</div>
          </div>
        )}

        {/* Scores list with collapsible events */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#214A27] mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading scores...</p>
          </div>
        ) : scores.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {(() => {
              // Group scores by event
              const groupedScores = scores.reduce((groups, score) => {
                const eventKey =
                  score.event?.documentId || score.event?.id || "no-event"
                if (!groups[eventKey]) {
                  groups[eventKey] = {
                    event: score.event,
                    scores: [],
                  }
                }
                groups[eventKey].scores.push(score)
                return groups
              }, {})

              return Object.entries(groupedScores).map(([eventKey, group]) => (
                <div
                  key={eventKey}
                  className="border border-gray-300 rounded-lg overflow-hidden">
                  {/* Clickable Event Header */}
                  <div
                    className="bg-red-100 px-4 py-3 cursor-pointer hover:bg-red-200 transition-colors flex justify-between items-center"
                    onClick={() => toggleEventExpansion(eventKey)}>
                    <div>
                      <h4 className="font-bold text-gray-800">
                        {group.event?.golf_club?.clubName || "Unknown Club"}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {group.event?.eventType || "Unknown Event"}
                        {group.event?.eventDate &&
                          ` • ${new Date(
                            group.event.eventDate
                          ).toLocaleDateString("en-GB")}`}
                      </p>
                      <p className="text-xs text-red-700 font-medium">
                        {group.scores.length}{" "}
                        {group.scores.length === 1 ? "score" : "scores"}
                      </p>
                    </div>
                    <div className="ml-4">
                      <svg
                        className={`w-5 h-5 text-gray-600 transition-transform ${
                          expandedEvents[eventKey] ? "rotate-180" : "rotate-0"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Collapsible Scores for this event */}
                  {expandedEvents[eventKey] && (
                    <div className="divide-y divide-gray-200 bg-white">
                      {group.scores.map((score) => (
                        <div
                          key={score.id || score.documentId}
                          className="p-3 hover:bg-red-50 cursor-pointer transition-colors"
                          onClick={(e) => {
                            e.stopPropagation() // Prevent event header click
                            handleScoreSelect(score.documentId || score.id)
                          }}>
                          <div className="flex justify-between items-center">
                            <div>
                              <h5 className="font-medium text-gray-800">
                                {score.golfer?.golferName || "Unknown Golfer"}
                              </h5>
                              <p className="text-sm text-gray-600">
                                Club:{" "}
                                {score.golfer?.golf_club?.clubName || "No club"}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg text-gray-800">
                                {score.golferEventScore}
                              </p>
                              {score.front9Score && score.back9Score && (
                                <p className="text-xs text-gray-500">
                                  ({score.front9Score} + {score.back9Score})
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            })()}
          </div>
        ) : (
          <p className="text-center text-gray-600">No scores found</p>
        )}

        <div className="flex justify-center mt-4">
          <button
            className="px-6 py-2 border border-gray-300 rounded text-white bg-red-600 hover:bg-red-700 transition duration-300"
            onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // Confirmation step
  return (
    <div className="space-y-4 bg-gray-100 p-6 rounded-lg shadow-lg border border-gray-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-800">
          Delete Score: {selectedScore?.golfer?.golferName} -{" "}
          {selectedScore?.event?.eventType}
        </h3>
        <button
          type="button"
          onClick={handleBack}
          className="text-sm text-blue-600 hover:text-blue-800">
          ← Back to Selection
        </button>
      </div>

      {/* Show submit message */}
      {submitMessage && (
        <div
          className={`text-center p-3 rounded mb-4 ${
            submitMessage.includes("✅")
              ? "bg-green-100 text-green-700 border border-green-300"
              : "bg-red-100 text-red-700 border border-red-300"
          }`}>
          <div className="font-medium">{submitMessage}</div>
        </div>
      )}

      {/* Score details */}
      <div className="bg-white border border-gray-300 rounded-lg p-4 mb-4">
        <h4 className="font-medium text-gray-800 mb-2">Score Details:</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>
            <strong>Golfer:</strong>{" "}
            {selectedScore?.golfer?.golferName || "Unknown"}
          </p>
          <p>
            <strong>Event:</strong>{" "}
            {selectedScore?.event?.eventType || "Unknown"}
            {selectedScore?.event?.eventDate &&
              ` (${new Date(selectedScore.event.eventDate).toLocaleDateString(
                "en-GB"
              )})`}
          </p>
          <p>
            <strong>Total Score:</strong> {selectedScore?.golferEventScore}
          </p>
          {(selectedScore?.front9Score || selectedScore?.back9Score) && (
            <p>
              <strong>9-Hole Breakdown:</strong>
              {selectedScore?.front9Score
                ? ` Front 9: ${selectedScore.front9Score}`
                : ""}
              {selectedScore?.back9Score
                ? ` Back 9: ${selectedScore.back9Score}`
                : ""}
            </p>
          )}
        </div>
      </div>

      {/* Safety warnings */}
      {safetyCheck && (
        <div className="space-y-3">
          {/* Blockers - prevent deletion */}
          {safetyCheck.blockers?.length > 0 && (
            <div className="bg-red-50 border border-red-300 rounded p-4">
              <h4 className="font-medium text-red-800 mb-2">
                🚫 Cannot Delete - Critical Issues:
              </h4>
              <ul className="text-sm text-red-700 space-y-1">
                {safetyCheck.blockers.map((blocker, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>{blocker}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings - allow deletion but warn user */}
          {safetyCheck.warnings?.length > 0 && safetyCheck.canDelete && (
            <div className="bg-yellow-50 border border-yellow-300 rounded p-4">
              <h4 className="font-medium text-yellow-800 mb-2">
                ⚠️ Warning - Associated Data:
              </h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                {safetyCheck.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-yellow-600 mt-2">
                Deleting this score may affect related records.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Deletion form - only show if deletion is allowed */}
      {safetyCheck?.canDelete && (
        <div className="bg-red-50 border border-red-300 rounded p-4">
          <h4 className="font-medium text-red-800 mb-3">⚠️ Confirm Deletion</h4>
          <p className="text-sm text-red-700 mb-3">
            This action cannot be undone. Type <strong>DELETE</strong> to
            confirm:
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type DELETE to confirm"
            className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent mb-3"
          />
          <button
            onClick={handleDelete}
            disabled={isDeleting || confirmText.toLowerCase() !== "delete"}
            className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
            {isDeleting ? "Deleting..." : "DELETE SCORE PERMANENTLY"}
          </button>
        </div>
      )}

      {/* Cancel button */}
      <div className="flex justify-center pt-4">
        <button
          type="button"
          onClick={handleBack}
          className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition duration-300">
          Cancel
        </button>
      </div>
    </div>
  )
}

export default DeleteScore
