import { useState, useEffect } from "react"
import { createScore, getAllScores } from "../../../utils/api/scoresApi"
import { getAllGolfers } from "../../../utils/api/golfersApi"
import { getAllFixtures } from "../../../utils/api/fixturesApi"

const AddScore = ({ onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")
  const [validationErrors, setValidationErrors] = useState([])
  const [existingScores, setExistingScores] = useState([])
  const [realtimeWarnings, setRealtimeWarnings] = useState([])
  const [golfers, setGolfers] = useState([])
  const [fixtures, setFixtures] = useState([])
  const [formData, setFormData] = useState({
    golferDocumentId: "",
    eventDocumentId: "",
    golferEventScore: "",
    front9Score: "",
    back9Score: "",
  })

  // Load existing scores, golfers, and fixtures for validation and selection
  useEffect(() => {
    const loadData = async () => {
      try {
        const [scores, golfersData, fixturesData] = await Promise.all([
          getAllScores(),
          getAllGolfers(),
          getAllFixtures(),
        ])
        setExistingScores(scores)

        // Sort golfers alphabetically by name (A-Z)
        const sortedGolfers = golfersData.sort((a, b) => {
          const nameA = (a.golferName || "").toLowerCase()
          const nameB = (b.golferName || "").toLowerCase()
          return nameA.localeCompare(nameB)
        })
        setGolfers(sortedGolfers)

        setFixtures(fixturesData)
        console.log("Loaded existing scores:", scores) // Debug log
        console.log("Loaded golfers:", sortedGolfers) // Debug log
        console.log("Loaded fixtures:", fixturesData) // Debug log
      } catch (error) {
        console.error("Error loading data:", error)
      }
    }
    loadData()
  }, [])

  // Real-time validation as user selects golfer/event
  const checkRealtimeConflicts = () => {
    if (
      !formData.golferDocumentId ||
      !formData.eventDocumentId ||
      existingScores.length === 0
    ) {
      setRealtimeWarnings([])
      return
    }

    const warnings = []

    existingScores.forEach((score) => {
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
      const result = await createScore({
        golferDocumentId: formData.golferDocumentId,
        eventDocumentId: formData.eventDocumentId,
        golferEventScore: parseInt(formData.golferEventScore),
        front9Score: formData.front9Score
          ? parseInt(formData.front9Score)
          : null,
        back9Score: formData.back9Score ? parseInt(formData.back9Score) : null,
      })

      console.log("Score created successfully:", result)
      setSubmitMessage("✅ Score added successfully!")

      // Call parent success handler
      if (onSuccess) {
        onSuccess(result)
      }

      // Reset form
      setFormData({
        golferDocumentId: "",
        eventDocumentId: "",
        golferEventScore: "",
        front9Score: "",
        back9Score: "",
      })
      setRealtimeWarnings([])
    } catch (error) {
      console.error("Error creating score:", error)

      if (error.validationErrors) {
        setValidationErrors(error.validationErrors)
        setSubmitMessage("❌ Please fix the validation errors below")
      } else {
        setSubmitMessage("❌ Failed to add score. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (onClose) {
      onClose()
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-gray-100 p-6 rounded-lg shadow-lg border border-gray-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-800">Add New Score</h3>
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
          onClick={handleCancel}
          className="px-6 py-2 border border-gray-300 rounded text-white bg-red-600 hover:bg-red-700 transition duration-300">
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-300 disabled:opacity-50">
          {isSubmitting ? "Adding..." : "Add Score"}
        </button>
      </div>
    </form>
  )
}

export default AddScore
