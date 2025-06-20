import { useState } from "react"
import { MODELS, QUERIES } from "../../../constants/api"
import useFetch from "../../../utils/hooks/useFetch"
import { queryBuilder } from "../../../utils/queryBuilder"
import { createFixture } from "../../../utils/api/fixturesApi"

const ManageFixtures = () => {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")
  const [formData, setFormData] = useState({
    eventDate: "",
    eventType: "",
    customEventType: "", // New field for custom event type
    golfClubId: "",
    eventReview: "",
  })

  // Fetch golf clubs data
  const query = queryBuilder(MODELS.golfClubs, QUERIES.clubsQuery)
  const { isLoading, isError, data: golfClubsData, error } = useFetch(query)

  const toggleForm = () => {
    setIsFormOpen((prev) => !prev)
    setSubmitMessage("") // Clear any previous messages
    // Reset form when closing
    if (isFormOpen) {
      setFormData({
        eventDate: "",
        eventType: "",
        customEventType: "", // Reset custom field
        golfClubId: "",
        eventReview: "",
      })
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
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage("")

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

      // Reset form and close after successful creation
      setFormData({
        eventDate: "",
        eventType: "",
        customEventType: "", // Reset custom field
        golfClubId: "",
        eventReview: "",
      })

      // Close form after a brief delay to show success message
      setTimeout(() => {
        setIsFormOpen(false)
        setSubmitMessage("")
      }, 2000)
    } catch (error) {
      console.error("Error creating fixture:", error)

      // Show detailed error information
      let errorMessage = "Unknown error"
      if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }

      setSubmitMessage(`❌ Error creating fixture: ${errorMessage}`)

      // Log detailed error info for debugging
      console.log("Full error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

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

  if (isError) {
    console.error("Error loading golf clubs:", error)
  }

  return (
    <div className="h-full flex flex-col space-y-4 bg-gray-100 p-6 rounded-lg shadow-lg">
      <h2 className="text-lg font-semibold text-center">Manage Fixtures</h2>

      {!isFormOpen ? (
        <div className="text-center">
          <p className="mb-6 text-gray-700">
            Add new fixtures to the competition calendar. Each fixture
            represents an event that will be played at a specific golf club.
          </p>
          <button
            className="bg-[#214A27] text-white px-6 py-3 rounded hover:bg-green-600 transition duration-300 font-medium"
            onClick={toggleForm}
            disabled={isLoading}>
            {isLoading ? "Loading..." : "Add New Fixture"}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-lg font-medium text-center text-gray-800">
            New Fixture Details
          </h3>
          <p className="text-sm text-gray-600 text-center mb-4">
            Please fill in the fixture information below
          </p>

          {/* Show submit message */}
          {submitMessage && (
            <div
              className={`text-center p-3 rounded ${
                submitMessage.includes("✅")
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}>
              {submitMessage}
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
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#214A27] focus:border-transparent"
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
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#214A27] focus:border-transparent"
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
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#214A27] focus:border-transparent"
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
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#214A27] focus:border-transparent"
              disabled={isLoading || isSubmitting}>
              <option value="">Select Golf Club</option>
              {golfClubsData?.data?.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.clubName} Golf Club
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
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition duration-300"
              onClick={toggleForm}
              disabled={isSubmitting}>
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#214A27] text-white rounded hover:bg-green-600 transition duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Fixture"}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default ManageFixtures
