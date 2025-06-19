import { useState } from "react"
import { MODELS, QUERIES } from "../../../constants/api"
import useFetch from "../../../utils/hooks/useFetch"
import { queryBuilder } from "../../../utils/queryBuilder"

const ManageFixtures = () => {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState({
    eventDate: "",
    eventType: "",
    golfClubId: "",
    eventReview: "",
  })

  // Fetch golf clubs data
  const query = queryBuilder(MODELS.golfClubs, QUERIES.clubsQuery)
  const { isLoading, isError, data: golfClubsData, error } = useFetch(query)

  const toggleForm = () => {
    setIsFormOpen((prev) => !prev)
    // Reset form when closing
    if (isFormOpen) {
      setFormData({
        eventDate: "",
        eventType: "",
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
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Prepare data for submission
    const submitData = {
      ...formData,
      golfClubId: formData.golfClubId ? parseInt(formData.golfClubId) : null,
    }

    console.log("Fixture form submitted:", submitData)

    // TODO: Send to Strapi API
    // await createFixture(submitData)

    // Reset form and close
    setFormData({
      eventDate: "",
      eventType: "",
      golfClubId: "",
      eventReview: "",
    })
    setIsFormOpen(false)
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
    <div className="h-full flex flex-col space-y-4 bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-lg font-semibold text-center text-white bg-[#214A27] -m-6 mb-4 p-4 rounded-t-lg">
        Manage Fixtures
      </h2>

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
                required>
                <option value="">Select Event Type</option>
                {eventTypes.map((type, index) => (
                  <option key={index} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
              disabled={isLoading}>
              <option value="">Select Golf Club (Optional)</option>
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

          {/* Event Review */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Review/Description
            </label>
            <textarea
              name="eventReview"
              value={formData.eventReview}
              onChange={handleChange}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#214A27] focus:border-transparent resize-none"
              placeholder="Optional description or review of the event..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition duration-300"
              onClick={toggleForm}>
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#214A27] text-white rounded hover:bg-green-600 transition duration-300 font-medium">
              Create Fixture
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default ManageFixtures
