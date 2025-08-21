import { useState, useEffect } from "react"
import { MODELS, QUERIES } from "../../../constants/api"
import useFetch from "../../../utils/hooks/useFetch"
import { queryBuilder } from "../../../utils/queryBuilder"
import { formatClubName } from "../../../utils/formatClubName"
import { createFixture, getAllFixtures } from "../../../utils/api/fixturesApi"

const AddFixture = ({ onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")
  const [validationErrors, setValidationErrors] = useState([])
  const [existingFixtures, setExistingFixtures] = useState([])
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

  // Fetch golf clubs data
  const query = queryBuilder(MODELS.golfClubs, QUERIES.clubsQuery)
  const { isLoading, isError, data: golfClubsData, error } = useFetch(query)

  // Load existing fixtures for real-time validation
  useEffect(() => {
    const loadExistingFixtures = async () => {
      try {
        const fixtures = await getAllFixtures()
        setExistingFixtures(fixtures)
        console.log("Loaded existing fixtures:", fixtures)
      } catch (error) {
        console.error("Error loading existing fixtures:", error)
      }
    }
    loadExistingFixtures()
  }, [])

  // Real-time validation as user types
  const checkRealtimeConflicts = (fieldName, value) => {
    if (!value || existingFixtures.length === 0) {
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
      existingFixtures.forEach((fixture) => {
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

  const resetForm = () => {
    setFormData({
      eventDate: "",
      eventType: "",
      customEventType: "",
      golfClubId: "",
      eventReview: "",
    })
    setValidationErrors([])
    setRealtimeWarnings([])
  }

  const handleCancel = () => {
    resetForm()
    setSubmitMessage("")
    if (onClose) onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Don't submit if there are real-time warnings
    if (realtimeWarnings.length > 0) {
      setSubmitMessage(
        "❌ Please resolve the scheduling conflicts above before submitting"
      )
      return
    }

    setIsSubmitting(true)
    setSubmitMessage("")
    setValidationErrors([])

    console.log("Form submission started...")

    try {
      // Prepare data for submission
      let golfClubDocumentId = null

      // If a golf club is selected, get its documentId from the fetched data
      if (formData.golfClubId) {
        const selectedClub = golfClubsData?.data?.find(
          (club) => club.id.toString() === formData.golfClubId.toString()
        )
        golfClubDocumentId = selectedClub?.documentId || selectedClub?.id
        console.log("Selected club:", selectedClub)
        console.log("Using documentId:", golfClubDocumentId)
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

      console.log("Creating fixture:", submitData)

      // Send to Strapi API
      const result = await createFixture(submitData)

      console.log("Fixture created successfully:", result)
      setSubmitMessage("✅ Fixture created successfully!")

      // Reset form data but keep message
      resetForm()

      // Reload existing fixtures after successful creation
      const updatedFixtures = await getAllFixtures()
      setExistingFixtures(updatedFixtures)

      // Close form after a brief delay to show success message
      setTimeout(() => {
        setSubmitMessage("")
        if (onClose) onClose()
        if (onSuccess) onSuccess(result)
      }, 2000)
    } catch (error) {
      console.error("Error creating fixture:", error)

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

        const fullErrorMessage = `❌ Error creating fixture: ${errorMessage}`
        console.log("Setting error message:", fullErrorMessage)
        setSubmitMessage(fullErrorMessage)
      }

      // Log detailed error info for debugging
      console.log("Full error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        validationErrors: error.validationErrors,
      })
    } finally {
      console.log("Setting isSubmitting to false")
      setIsSubmitting(false)
    }
  }

  if (isError) {
    console.error("Error loading golf clubs:", error)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-gray-100 p-6 rounded-lg shadow-lg border border-gray-300">
      <h3 className="text-lg font-medium text-center text-gray-800">
        New Fixture Details
      </h3>
      <p className="text-sm text-gray-600 text-center mb-4">
        Please fill in the fixture information below
      </p>

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
          <p className="text-xs text-red-600 mt-3">
            Please modify the conflicting information or contact support if you
            believe this is an error.
          </p>
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
          disabled={isLoading || isSubmitting}>
          <option value="">Select Golf Club</option>
          {golfClubsData?.data?.map((club) => (
            <option key={club.id} value={club.id}>
              {formatClubName(club.clubName)}
            </option>
          ))}
        </select>
        {isError && (
          <p className="text-red-500 text-sm mt-1">
            Error loading golf clubs. You can still create the fixture.
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          className="px-6 py-2 border border-gray-300 text-white rounded bg-red-600 hover:bg-red-700 transition duration-300"
          onClick={handleCancel}
          disabled={isSubmitting}>
          Cancel
        </button>
        <button
          type="submit"
          className={`px-6 py-2 bg-[#214A27] text-white rounded hover:bg-green-600 transition duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
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
              Creating...
            </span>
          ) : (
            "Create Fixture"
          )}
        </button>
      </div>
    </form>
  )
}

export default AddFixture
