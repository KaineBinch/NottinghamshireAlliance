import { useState, useEffect } from "react"
import {
  getAllScores,
  getScoreById,
  updateScore,
} from "../../../utils/api/scoresApi"
import { getAllGolfers } from "../../../utils/api/golfersApi"
import { getAllFixtures } from "../../../utils/api/fixturesApi"

const EditScore = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState("select") // "select" or "edit"
  const [scores, setScores] = useState([])
  const [selectedScore, setSelectedScore] = useState(null)
  const [golfers, setGolfers] = useState([])
  const [fixtures, setFixtures] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")
  const [validationErrors, setValidationErrors] = useState([])
  const [realtimeWarnings, setRealtimeWarnings] = useState([])
  const [expandedEvents, setExpandedEvents] = useState({}) // Track which events are expanded
  const [formData, setFormData] = useState({
    golferDocumentId: "",
    eventDocumentId: "",
    golferEventScore: "",
    front9Score: "",
    back9Score: "",
  })

  // Load all scores on component mount
  useEffect(() => {
    const loadScores = async () => {
      setIsLoading(true)
      try {
        const scoresData = await getAllScores()
        // Sort scores by event date (most recent first), then by golfer name
        const sortedScores = scoresData.sort((a, b) => {
          const dateA = new Date(a.event?.eventDate || 0)
          const dateB = new Date(b.event?.eventDate || 0)
          if (dateA.getTime() !== dateB.getTime()) {
            return dateB - dateA // Most recent events first
          }
          // If same event, sort by golfer name
          const nameA = (a.golfer?.golferName || "").toLowerCase()
          const nameB = (b.golfer?.golferName || "").toLowerCase()
          return nameA.localeCompare(nameB)
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

  // Load golfers and fixtures when needed
  useEffect(() => {
    if (step === "edit") {
      const loadData = async () => {
        try {
          const [golfersData, fixturesData] = await Promise.all([
            getAllGolfers(),
            getAllFixtures(),
          ])
          setGolfers(golfersData)
          setFixtures(fixturesData)
        } catch (error) {
          console.error("Error loading data:", error)
        }
      }
      loadData()
    }
  }, [step])

  // Real-time validation as user selects golfer/event (excluding current score)
  const checkRealtimeConflicts = () => {
    if (
      !formData.golferDocumentId ||
      !formData.eventDocumentId ||
      scores.length === 0
    ) {
      setRealtimeWarnings([])
      return
    }

    const warnings = []

    scores.forEach((score) => {
      // Skip validation for the score being edited
      if (
        selectedScore &&
        (score.id === selectedScore.id ||
          score.documentId === selectedScore.documentId)
      ) {
        return
      }

      // Check for duplicate score (same golfer + same event)
      if (
        score.golfer?.documentId === formData.golferDocumentId &&
        score.event?.documentId === formData.eventDocumentId
      ) {
        const golferName = score.golfer?.golferName || "Selected golfer"
        const eventType = score.event?.eventType || "Selected event"
        warnings.push(
          `⚠️ A score already exists for ${golferName} in ${eventType}`
        )
      }
    })

    setRealtimeWarnings(warnings)
  }

  const toggleEventExpansion = (eventKey) => {
    setExpandedEvents((prev) => ({
      ...prev,
      [eventKey]: !prev[eventKey],
    }))
  }

  const handleScoreSelect = async (scoreId) => {
    if (!scoreId) return

    setIsLoading(true)
    try {
      const scoreData = await getScoreById(scoreId)
      setSelectedScore(scoreData)

      // Populate form with existing data
      setFormData({
        golferDocumentId:
          scoreData.golfer?.documentId || scoreData.golfer?.id || "",
        eventDocumentId:
          scoreData.event?.documentId || scoreData.event?.id || "",
        golferEventScore: scoreData.golferEventScore?.toString() || "",
        front9Score: scoreData.front9Score?.toString() || "",
        back9Score: scoreData.back9Score?.toString() || "",
      })

      setStep("edit")
    } catch (error) {
      console.error("Error loading score details:", error)
      setSubmitMessage("❌ Error loading score details")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear previous validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([])
    }

    // Clear submit message when user starts typing
    if (submitMessage) {
      setSubmitMessage("")
    }

    // Perform real-time validation when golfer or event changes
    setTimeout(() => {
      checkRealtimeConflicts()
    }, 100)
  }

  const validateForm = () => {
    const errors = []

    // Required field validation
    if (!formData.golferDocumentId) {
      errors.push("Golfer selection is required")
    }

    if (!formData.eventDocumentId) {
      errors.push("Event selection is required")
    }

    if (!formData.golferEventScore?.trim()) {
      errors.push("Total event score is required")
    } else {
      const totalScore = parseInt(formData.golferEventScore)
      if (isNaN(totalScore) || totalScore < 1 || totalScore > 200) {
        errors.push(
          "Total event score must be a valid number between 1 and 200"
        )
      }
    }

    // Validate 9-hole scores if provided
    if (formData.front9Score?.trim()) {
      const front9 = parseInt(formData.front9Score)
      if (isNaN(front9) || front9 < 1 || front9 > 100) {
        errors.push("Front 9 score must be a valid number between 1 and 100")
      }
    }

    if (formData.back9Score?.trim()) {
      const back9 = parseInt(formData.back9Score)
      if (isNaN(back9) || back9 < 1 || back9 > 100) {
        errors.push("Back 9 score must be a valid number between 1 and 100")
      }
    }

    // Validate that front9 + back9 equals total (if both 9-hole scores provided)
    if (
      formData.front9Score?.trim() &&
      formData.back9Score?.trim() &&
      formData.golferEventScore?.trim()
    ) {
      const front9 = parseInt(formData.front9Score)
      const back9 = parseInt(formData.back9Score)
      const total = parseInt(formData.golferEventScore)

      if (!isNaN(front9) && !isNaN(back9) && !isNaN(total)) {
        if (front9 + back9 !== total) {
          errors.push(
            `Front 9 (${front9}) + Back 9 (${back9}) must equal Total Score (${total})`
          )
        }
      }
    }

    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate form
    const errors = validateForm()
    if (errors.length > 0) {
      setValidationErrors(errors)
      return
    }

    // Check for real-time warnings
    if (realtimeWarnings.length > 0) {
      setValidationErrors(realtimeWarnings)
      return
    }

    setIsSubmitting(true)
    setSubmitMessage("")
    setValidationErrors([])

    try {
      const result = await updateScore(
        selectedScore.id || selectedScore.documentId,
        {
          golferDocumentId: formData.golferDocumentId,
          eventDocumentId: formData.eventDocumentId,
          golferEventScore: parseInt(formData.golferEventScore),
          front9Score: formData.front9Score
            ? parseInt(formData.front9Score)
            : null,
          back9Score: formData.back9Score
            ? parseInt(formData.back9Score)
            : null,
        }
      )

      console.log("Score updated successfully:", result)
      setSubmitMessage("✅ Score updated successfully!")

      // Call parent success handler
      if (onSuccess) {
        onSuccess(result)
      }
    } catch (error) {
      console.error("Error updating score:", error)

      if (error.validationErrors) {
        setValidationErrors(error.validationErrors)
        setSubmitMessage("❌ Please fix the validation errors below")
      } else {
        setSubmitMessage("❌ Failed to update score. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    setStep("select")
    setSelectedScore(null)
    setSubmitMessage("")
    setValidationErrors([])
    setRealtimeWarnings([])
    setExpandedEvents({}) // Reset expanded events
    setFormData({
      golferDocumentId: "",
      eventDocumentId: "",
      golferEventScore: "",
      front9Score: "",
      back9Score: "",
    })
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
            Select Score to Edit
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
                    className="bg-green-100 px-4 py-3 cursor-pointer hover:bg-green-200 transition-colors flex justify-between items-center"
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
                      <p className="text-xs text-green-700 font-medium">
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
                          className="p-3 hover:bg-green-50 cursor-pointer transition-colors"
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

  // Edit form (similar to AddScore but with existing data)
  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-gray-100 p-6 rounded-lg shadow-lg border border-gray-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-800">
          Edit Score: {selectedScore?.golfer?.golferName} -{" "}
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

      {/* Show validation errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-100 text-red-700 border border-red-300 rounded p-3 mb-4">
          <div className="font-medium mb-2">
            Please fix the following errors:
          </div>
          <ul className="list-disc list-inside space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index} className="text-sm">
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Show real-time warnings */}
      {realtimeWarnings.length > 0 && (
        <div className="bg-yellow-100 text-yellow-700 border border-yellow-300 rounded p-3 mb-4">
          <div className="font-medium mb-2">Warnings:</div>
          <ul className="list-disc list-inside space-y-1">
            {realtimeWarnings.map((warning, index) => (
              <li key={index} className="text-sm">
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Golfer Selection */}
      <div>
        <label
          htmlFor="golferDocumentId"
          className="block text-sm font-medium text-gray-700 mb-1">
          Golfer *
        </label>
        <select
          id="golferDocumentId"
          name="golferDocumentId"
          value={formData.golferDocumentId}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
          <option value="">Select a golfer</option>
          {golfers.map((golfer) => (
            <option
              key={golfer.documentId || golfer.id}
              value={golfer.documentId || golfer.id}>
              {golfer.golferName} ({golfer.golf_club?.clubName || "No club"})
            </option>
          ))}
        </select>
      </div>

      {/* Event Selection */}
      <div>
        <label
          htmlFor="eventDocumentId"
          className="block text-sm font-medium text-gray-700 mb-1">
          Event *
        </label>
        <select
          id="eventDocumentId"
          name="eventDocumentId"
          value={formData.eventDocumentId}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
          <option value="">Select an event</option>
          {fixtures.map((fixture) => (
            <option
              key={fixture.documentId || fixture.id}
              value={fixture.documentId || fixture.id}>
              {fixture.eventType} -{" "}
              {new Date(fixture.eventDate).toLocaleDateString("en-GB")} (
              {fixture.golf_club?.clubName || "No club"})
            </option>
          ))}
        </select>
      </div>

      {/* Total Event Score */}
      <div>
        <label
          htmlFor="golferEventScore"
          className="block text-sm font-medium text-gray-700 mb-1">
          Total Event Score *
        </label>
        <input
          type="number"
          id="golferEventScore"
          name="golferEventScore"
          value={formData.golferEventScore}
          onChange={handleInputChange}
          required
          min="1"
          max="200"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Enter total score for the event"
        />
      </div>

      {/* Front 9 Score  */}
      <div>
        <label
          htmlFor="front9Score"
          className="block text-sm font-medium text-gray-700 mb-1">
          Front 9 Score
        </label>
        <input
          type="number"
          id="front9Score"
          name="front9Score"
          value={formData.front9Score}
          onChange={handleInputChange}
          min="1"
          max="100"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Enter front 9 score"
        />
      </div>

      {/* Back 9 Score  */}
      <div>
        <label
          htmlFor="back9Score"
          className="block text-sm font-medium text-gray-700 mb-1">
          Back 9 Score
        </label>
        <input
          type="number"
          id="back9Score"
          name="back9Score"
          value={formData.back9Score}
          onChange={handleInputChange}
          min="1"
          max="100"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Enter back 9 score"
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={handleBack}
          className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition duration-300">
          Back
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-300 disabled:opacity-50">
          {isSubmitting ? "Updating..." : "Update Score"}
        </button>
      </div>
    </form>
  )
}

export default EditScore
