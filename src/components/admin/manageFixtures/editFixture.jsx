import { useState, useEffect } from "react"
import {
  getAllFixtures,
  getFixtureById,
  updateFixture,
} from "../../../utils/api/fixturesApi"
import { getAllGolfClubs } from "../../../utils/api/clubsApi"

const EditFixture = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState("select") // "select" or "edit"
  const [fixtures, setFixtures] = useState([])
  const [golfClubs, setGolfClubs] = useState([])
  const [selectedFixture, setSelectedFixture] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")
  const [validationErrors, setValidationErrors] = useState([])
  const [realtimeWarnings, setRealtimeWarnings] = useState([])
  const [formData, setFormData] = useState({
    eventDate: "",
    eventType: "",
    customEventType: "",
    golfClubId: "",
    eventReview: "",
  })

  const eventTypes = [
    "Order of Merit",
    "Team Event",
    "Roy Fletcher Memorial",
    "Presidents Day",
    "Away Trip",
    "Harry Brown",
    "Singles",
    "Other",
  ]

  // Load all fixtures and golf clubs on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [fixturesData, clubsData] = await Promise.all([
          getAllFixtures(),
          getAllGolfClubs(),
        ])

        // Sort fixtures by date (most recent first) then by event type
        const sortedFixtures = fixturesData.sort((a, b) => {
          const dateA = new Date(a.eventDate)
          const dateB = new Date(b.eventDate)
          if (dateA.getTime() !== dateB.getTime()) {
            return dateB - dateA // Most recent first
          }
          return (a.eventType || "").localeCompare(b.eventType || "")
        })

        setFixtures(sortedFixtures)
        setGolfClubs(clubsData)
      } catch (error) {
        console.error("Error loading data:", error)
        setSubmitMessage("❌ Error loading fixtures and clubs")
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  // Real-time validation as user types (excluding current fixture)
  const checkRealtimeConflicts = (fieldName, value) => {
    if (!value || fixtures.length === 0) {
      setRealtimeWarnings([])
      return
    }

    const warnings = []

    // Get current form values for comprehensive checking
    const currentEventDate =
      fieldName === "eventDate" ? value : formData.eventDate
    const currentEventType =
      fieldName === "eventType"
        ? value
        : fieldName === "customEventType"
        ? value
        : formData.eventType === "Other"
        ? formData.customEventType
        : formData.eventType
    const currentGolfClubId =
      fieldName === "golfClubId" ? value : formData.golfClubId

    if (currentEventDate && currentEventType) {
      fixtures.forEach((fixture) => {
        // Skip the fixture being edited - check multiple ID formats
        if (
          selectedFixture &&
          (fixture.id === selectedFixture.id ||
            fixture.documentId === selectedFixture.documentId ||
            fixture.id === selectedFixture.documentId ||
            fixture.documentId === selectedFixture.id ||
            fixture.id?.toString() === selectedFixture.id?.toString() ||
            fixture.documentId?.toString() ===
              selectedFixture.documentId?.toString())
        ) {
          return
        }

        // Check for same date + same event type + same club (exact duplicate)
        if (
          fixture.eventDate === currentEventDate &&
          fixture.eventType === currentEventType &&
          fixture.golf_club?.documentId === currentGolfClubId
        ) {
          const clubName = fixture.golf_club?.clubName || "this club"
          warnings.push(
            `A ${currentEventType} event is already scheduled for ${currentEventDate} at ${clubName}`
          )
        }

        // Check for same date + same event type at different club (potential conflict)
        if (
          fixture.eventDate === currentEventDate &&
          fixture.eventType === currentEventType &&
          fixture.golf_club?.documentId !== currentGolfClubId &&
          currentGolfClubId
        ) {
          const clubName = fixture.golf_club?.clubName || "another club"
          warnings.push(
            `A ${currentEventType} event is already scheduled for ${currentEventDate} at ${clubName}`
          )
        }
      })
    }

    setRealtimeWarnings(warnings)
  }

  const handleFixtureSelect = async (fixtureId) => {
    if (!fixtureId) return

    console.log("Selected fixture ID:", fixtureId)
    setIsLoading(true)
    try {
      const fixtureData = await getFixtureById(fixtureId)
      console.log("Loaded fixture data:", fixtureData)
      setSelectedFixture(fixtureData)

      // Find the golf club ID for the form
      const clubId =
        fixtureData.golf_club?.id || fixtureData.golf_club?.documentId || ""

      // Populate form with existing data
      setFormData({
        eventDate: fixtureData.eventDate || "",
        eventType: eventTypes.includes(fixtureData.eventType)
          ? fixtureData.eventType
          : "Other",
        customEventType: eventTypes.includes(fixtureData.eventType)
          ? ""
          : fixtureData.eventType || "",
        golfClubId: clubId.toString(),
        eventReview: fixtureData.eventReview || "",
      })

      setStep("edit")
    } catch (error) {
      console.error("Error loading fixture details:", error)
      setSubmitMessage("❌ Error loading fixture details: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear custom event type if user changes away from "Other"
    if (name === "eventType" && value !== "Other") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        customEventType: "",
      }))
    }

    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([])
      setSubmitMessage("")
    }

    // Check for real-time conflicts
    checkRealtimeConflicts(name, value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Don't submit if there are real-time warnings
    if (realtimeWarnings.length > 0) {
      setSubmitMessage(
        "❌ Please resolve the conflicts above before submitting"
      )
      return
    }

    setIsSubmitting(true)
    setSubmitMessage("")
    setValidationErrors([])

    try {
      // Prepare data for submission
      let golfClubDocumentId = null

      // If a golf club is selected, get its documentId from the loaded data
      if (formData.golfClubId) {
        const selectedClub = golfClubs.find(
          (club) => club.id.toString() === formData.golfClubId.toString()
        )
        golfClubDocumentId = selectedClub?.documentId || selectedClub?.id
      }

      // Use custom event type if "Other" is selected, otherwise use the selected event type
      const finalEventType =
        formData.eventType === "Other"
          ? formData.customEventType
          : formData.eventType

      const submitData = {
        eventDate: formData.eventDate,
        eventType: finalEventType,
        eventReview: formData.eventReview || null,
        golfClubDocumentId: golfClubDocumentId,
      }

      console.log("Updating fixture:", submitData)

      const result = await updateFixture(
        selectedFixture.id || selectedFixture.documentId,
        submitData
      )

      console.log("Fixture updated successfully:", result)
      setSubmitMessage("✅ Fixture updated successfully!")

      // Close form after a brief delay to show success message
      setTimeout(() => {
        setSubmitMessage("")
        if (onClose) onClose()
        if (onSuccess) onSuccess(result)
      }, 2000)
    } catch (error) {
      console.error("Error updating fixture:", error)

      // Handle validation errors specifically
      if (error.validationErrors && Array.isArray(error.validationErrors)) {
        setValidationErrors(error.validationErrors)
        setSubmitMessage("❌ Fixture scheduling conflicts found:")
      } else {
        // Handle other API errors
        let errorMessage = "Unknown error"
        if (error.response?.data?.error?.message) {
          errorMessage = error.response.data.error.message
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error.message) {
          errorMessage = error.message
        }

        const fullErrorMessage = `❌ Error updating fixture: ${errorMessage}`
        setSubmitMessage(fullErrorMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    setStep("select")
    setSelectedFixture(null)
    setFormData({
      eventDate: "",
      eventType: "",
      customEventType: "",
      golfClubId: "",
      eventReview: "",
    })
    setValidationErrors([])
    setRealtimeWarnings([])
    setSubmitMessage("")
  }

  const handleCancel = () => {
    handleBack()
    if (onClose) onClose()
  }

  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (step === "select") {
    return (
      <div className="space-y-4 bg-gray-100 p-6 rounded-lg shadow-lg border border-gray-300">
        <h3 className="text-lg font-medium text-center text-gray-800">
          Select Fixture to Edit
        </h3>
        <p className="text-sm text-gray-600 text-center mb-4">
          Choose which fixture you want to edit from the list below (sorted by
          date)
        </p>

        {submitMessage && (
          <div className="text-center p-3 rounded mb-4 bg-red-100 text-red-700 border border-red-300">
            <div className="font-medium">{submitMessage}</div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#214A27] mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading fixtures...</p>
          </div>
        ) : fixtures.length > 0 ? (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {fixtures.map((fixture) => (
              <div
                key={fixture.id || fixture.documentId}
                className="border border-gray-300 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() =>
                  handleFixtureSelect(fixture.documentId || fixture.id)
                }>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-800">
                      {fixture.eventType}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {formatDate(fixture.eventDate)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {fixture.golf_club?.clubName
                        ? `at ${fixture.golf_club.clubName}`
                        : "No club assigned"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-blue-500">
                      ID: {fixture.documentId || fixture.id}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600">No fixtures found</p>
        )}

        <div className="flex justify-center mt-4">
          <button
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition duration-300"
            onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // Edit form
  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-gray-100 p-6 rounded-lg shadow-lg border border-gray-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-800">
          Edit Fixture: {selectedFixture?.eventType}
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

      {/* Show real-time warnings */}
      {realtimeWarnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-300 rounded p-4 mb-4">
          <h4 className="font-medium text-yellow-800 mb-2">
            ⚠️ Potential Scheduling Conflicts:
          </h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            {realtimeWarnings.map((warning, index) => (
              <li key={index} className="flex items-start">
                <span className="text-yellow-500 mr-2">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-yellow-600 mt-2">
            Please modify the conflicting information before submitting.
          </p>
        </div>
      )}

      {/* Show validation errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-300 rounded p-4 mb-4">
          <h4 className="font-medium text-red-800 mb-2">
            The following conflicts were found:
          </h4>
          <ul className="text-sm text-red-700 space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index} className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Event Date and Type Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Date *
          </label>
          <input
            type="date"
            name="eventDate"
            value={formData.eventDate}
            onChange={handleChange}
            className={`w-full p-3 border rounded focus:ring-2 focus:ring-[#214A27] focus:border-transparent ${
              realtimeWarnings.some((w) => w.includes("scheduled"))
                ? "border-yellow-400 bg-yellow-50"
                : "border-gray-300"
            }`}
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Type *
          </label>
          <select
            name="eventType"
            value={formData.eventType}
            onChange={handleChange}
            className={`w-full p-3 border rounded focus:ring-2 focus:ring-[#214A27] focus:border-transparent ${
              realtimeWarnings.some((w) => w.includes("scheduled"))
                ? "border-yellow-400 bg-yellow-50"
                : "border-gray-300"
            }`}
            required
            disabled={isSubmitting}>
            <option value="">Select Event Type</option>
            {eventTypes.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Custom Event Type Field - Only show when "Other" is selected */}
      {formData.eventType === "Other" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Event Type *
          </label>
          <input
            type="text"
            name="customEventType"
            value={formData.customEventType}
            onChange={handleChange}
            placeholder="Enter custom event type"
            className={`w-full p-3 border rounded focus:ring-2 focus:ring-[#214A27] focus:border-transparent ${
              realtimeWarnings.some((w) => w.includes("scheduled"))
                ? "border-yellow-400 bg-yellow-50"
                : "border-gray-300"
            }`}
            required
            disabled={isSubmitting}
          />
        </div>
      )}

      {/* Golf Club Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Host Golf Club
        </label>
        <select
          name="golfClubId"
          value={formData.golfClubId}
          onChange={handleChange}
          className={`w-full p-3 border rounded focus:ring-2 focus:ring-[#214A27] focus:border-transparent ${
            realtimeWarnings.some((w) => w.includes("scheduled"))
              ? "border-yellow-400 bg-yellow-50"
              : "border-gray-300"
          }`}
          disabled={isSubmitting}>
          <option value="">Select Golf Club</option>
          {golfClubs.map((club) => (
            <option key={club.id} value={club.id}>
              {club.clubName} Golf Club
            </option>
          ))}
        </select>
      </div>

      {/* Event Review */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Event Review/Notes
        </label>
        <textarea
          name="eventReview"
          value={formData.eventReview}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#214A27] focus:border-transparent"
          placeholder="Optional event review or notes..."
          rows="3"
          disabled={isSubmitting}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition duration-300"
          onClick={handleCancel}
          disabled={isSubmitting}>
          Cancel
        </button>
        <button
          type="submit"
          className={`px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
            isSubmitting || realtimeWarnings.length > 0 ? "opacity-75" : ""
          }`}
          disabled={isSubmitting || realtimeWarnings.length > 0}>
          {isSubmitting ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
              Updating...
            </span>
          ) : (
            "Update Fixture"
          )}
        </button>
      </div>
    </form>
  )
}

export default EditFixture
