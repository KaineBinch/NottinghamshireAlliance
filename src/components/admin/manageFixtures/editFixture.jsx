import { useState, useEffect } from "react"
import { MODELS, QUERIES } from "../../../constants/api"
import useFetch from "../../../utils/hooks/useFetch"
import { queryBuilder } from "../../../utils/queryBuilder"
import {
  getAllFixtures,
  getFixtureById,
  updateFixture,
} from "../../../utils/api/fixturesApi"

const EditFixture = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState("select") // "select", "edit", or "updating"
  const [fixtures, setFixtures] = useState([])
  const [selectedFixture, setSelectedFixture] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")
  const [validationErrors, setValidationErrors] = useState([])
  const [realtimeWarnings, setRealtimeWarnings] = useState([])
  const [existingFixtures, setExistingFixtures] = useState([])
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
  const {
    isLoading: clubsLoading,
    isError,
    data: golfClubsData,
    error,
  } = useFetch(query)

  // Load all fixtures on component mount
  useEffect(() => {
    const loadFixtures = async () => {
      setIsLoading(true)
      try {
        const fixturesData = await getAllFixtures()
        // Sort fixtures by date (most recent first) then by event type
        const sortedFixtures = fixturesData.sort((a, b) => {
          const dateA = new Date(a.eventDate)
          const dateB = new Date(b.eventDate)
          if (dateA.getTime() !== dateB.getTime()) {
            return dateA - dateB
          }
          return (a.eventType || "").localeCompare(b.eventType || "")
        })
        setFixtures(sortedFixtures)
        setExistingFixtures(sortedFixtures)
      } catch (error) {
        console.error("Error loading fixtures:", error)
        setSubmitMessage("❌ Error loading fixtures")
      } finally {
        setIsLoading(false)
      }
    }
    loadFixtures()
  }, [])

  const handleFixtureSelect = async (fixtureId) => {
    if (!fixtureId) return

    setIsLoading(true)
    try {
      const fixtureData = await getFixtureById(fixtureId)
      setSelectedFixture(fixtureData)

      // Pre-populate form with existing data
      const isCustomType = !eventTypes.includes(fixtureData.eventType)
      setFormData({
        eventDate: fixtureData.eventDate || "",
        eventType: isCustomType ? "Other" : fixtureData.eventType || "",
        customEventType: isCustomType ? fixtureData.eventType || "" : "",
        golfClubId:
          fixtureData.golf_club?.documentId || fixtureData.golf_club?.id || "",
        eventReview: fixtureData.eventReview || "",
      })

      setStep("edit")
    } catch (error) {
      console.error("Error loading fixture details:", error)
      setSubmitMessage("❌ Error loading fixture details")
    } finally {
      setIsLoading(false)
    }
  }

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
        // Skip checking against the fixture we're currently editing
        const currentFixtureId =
          selectedFixture?.id || selectedFixture?.documentId
        const fixtureId = fixture.id || fixture.documentId
        if (fixtureId === currentFixtureId) return

        // Check for conflicts with other fixtures
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

  const handleUpdate = async (e) => {
    e.preventDefault()

    // Don't submit if there are real-time warnings
    if (realtimeWarnings.length > 0) {
      setSubmitMessage(
        "❌ Please resolve the scheduling conflicts above before submitting"
      )
      return
    }

    setIsUpdating(true)
    setSubmitMessage("")
    setValidationErrors([])

    try {
      // Prepare data for submission
      let golfClubDocumentId = null

      // If a golf club is selected, get its documentId from the fetched data
      if (formData.golfClubId) {
        const selectedClub = golfClubsData?.data?.find(
          (club) =>
            (club.id || club.documentId).toString() ===
            formData.golfClubId.toString()
        )
        golfClubDocumentId = selectedClub?.documentId || selectedClub?.id
      }

      // Use custom event type if "Other" is selected, otherwise use the selected event type
      const finalEventType =
        formData.eventType === "Other"
          ? formData.customEventType
          : formData.eventType

      const updateData = {
        eventDate: formData.eventDate,
        eventType: finalEventType,
        eventReview: formData.eventReview || null,
        golfClubDocumentId: golfClubDocumentId,
      }

      const result = await updateFixture(
        selectedFixture.id || selectedFixture.documentId,
        updateData
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

        setSubmitMessage(`❌ Error updating fixture: ${errorMessage}`)
      }
    } finally {
      setIsUpdating(false)
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
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatDateShort = (dateString) => {
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
          Choose which fixture you want to modify
        </p>

        {submitMessage && (
          <div className="text-center p-3 rounded mb-4 bg-red-100 text-red-700 border border-red-300">
            <div className="font-medium">{submitMessage}</div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading fixtures...</p>
          </div>
        ) : fixtures.length > 0 ? (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {fixtures.map((fixture) => (
              <div
                key={fixture.id || fixture.documentId}
                className="border border-gray-300 rounded-lg p-4 hover:bg-green-50 cursor-pointer transition-colors duration-200 hover:border-green-300 bg-gray-200"
                onClick={() =>
                  handleFixtureSelect(fixture.id || fixture.documentId)
                }>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-800 text-lg">
                      {fixture.golf_club?.clubName || "No club assigned"}
                    </h4>
                    <span className="text-sm font-medium text-gray-600 bg-gray-200 px-2 py-1 rounded">
                      {formatDateShort(fixture.eventDate)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-gray-600">{fixture.eventType}</p>
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
            className="px-6 py-2 border border-gray-300 rounded text-white bg-red-600 hover:bg-red-700 transition duration-300"
            onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // Edit step
  return (
    <div className="space-y-4 bg-gray-100 p-6 rounded-lg shadow-lg border border-gray-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-800">
          Edit Fixture: {selectedFixture?.eventType}
        </h3>
        <button
          type="button"
          onClick={handleBack}
          className="text-sm text-blue-600 hover:text-blue-800"
          disabled={isUpdating}>
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
          <p className="text-xs text-red-600 mt-3">
            Please modify the conflicting information or contact support if you
            believe this is an error.
          </p>
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-4">
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
              disabled={isUpdating}
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
              disabled={isUpdating}>
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
              disabled={isUpdating}
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
            disabled={clubsLoading || isUpdating}>
            <option value="">Select Golf Club</option>
            {golfClubsData?.data?.map((club) => (
              <option key={club.id} value={club.documentId || club.id}>
                {club.clubName} Golf Club
              </option>
            ))}
          </select>
          {isError && (
            <p className="text-red-500 text-sm mt-1">
              Error loading golf clubs. You can still update the fixture.
            </p>
          )}
        </div>

        {/* Event Review */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Review
          </label>
          <textarea
            name="eventReview"
            value={formData.eventReview}
            onChange={handleChange}
            placeholder="Add any notes or review about this fixture"
            rows={3}
            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#214A27] focus:border-transparent"
            disabled={isUpdating}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            className="px-6 py-2 border border-gray-300 rounded text-white bg-red-600 hover:bg-red-700 transition duration-300"
            onClick={handleCancel}
            disabled={isUpdating}>
            Cancel
          </button>
          <button
            type="submit"
            className={`px-6 py-2 bg-[#214A27] text-white rounded hover:bg-green-600 transition duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
              isUpdating || realtimeWarnings.length > 0 ? "opacity-75" : ""
            }`}
            disabled={isUpdating || realtimeWarnings.length > 0}>
            {isUpdating ? (
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
    </div>
  )
}

export default EditFixture
