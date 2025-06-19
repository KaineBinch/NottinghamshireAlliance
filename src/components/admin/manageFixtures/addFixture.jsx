import { useState } from "react"

const AddFixture = ({ golfClubsData }) => {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState({
    eventDate: "",
    eventType: "",
    golfers: "",
    golfClubs: "",
    scores: "",
    teeTimes: "",
    eventReviewText: "",
  })

  const toggleForm = () => setIsFormOpen((prev) => !prev)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    toggleForm()
  }

  const eventTypes = [
    "Order of Merit",
    "Team Event",
    "Roy Fletcher Memorial",
    "Presidents Day",
    "Away Trip",
    "Harry Brown",
    "Singles",
  ]

  return (
    <div className="h-full flex flex-col space-y-4 bg-gray-100 p-6 rounded-t-lg shadow-lg">
      {!isFormOpen ? (
        <button
          className="bg-[#214A27] text-white px-4 py-2 rounded hover:bg-green-600 transition"
          onClick={toggleForm}>
          Add New Fixture
        </button>
      ) : (
        <div className="relative mt-4">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col space-y-4 bg-gray-100 p-6 rounded shadow-xl border border-gray-300">
            <h2 className="text-lg font-semibold text-center">
              Add New Fixture
            </h2>
            <h4>Please enter the event details below.</h4>
            <div className="">
              {/* Event Date and Event Type on Same Row */}
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">
                    Event Date
                  </label>
                  <input
                    type="date"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>

                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">
                    Event Type
                  </label>
                  <select
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    required>
                    <option value="" disabled>
                      Select Event Type
                    </option>
                    {/* Render dynamic eventType options from the enum */}
                    {eventTypes.map((type, index) => (
                      <option key={index} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Golf Club Relation */}
              <div>
                <label className="text-sm font-medium mt-4 mb-2 block">
                  Golf Club
                </label>
                <select
                  name="golfClubs"
                  value={formData.golfClubs}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded">
                  <option value="" disabled>
                    Select Golf Club
                  </option>
                  {golfClubsData?.map((club) => (
                    <option key={club.id} value={club.id}>
                      {club.clubName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-2 mt-5">
                <button
                  type="submit"
                  className="bg-[#214A27] text-white px-4 py-2 rounded hover:bg-green-600 transition">
                  Submit
                </button>
                <button
                  type="button"
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-400 transition"
                  onClick={toggleForm}>
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default AddFixture
