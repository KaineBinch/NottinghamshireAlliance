import { useState } from "react"

const AddClub = () => {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState({
    clubName: "",
    clubAddress: "",
    clubURL: "",
    clubContactNumber: "",
    clubID: "",
    proName: "",
    clubImage: null,
    clubLogo: null,
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

  return (
    <div className="h-full flex flex-col space-y-4 bg-gray-100 p-6 rounded-b-lg shadow-xl">
      {!isFormOpen ? (
        <button
          className="bg-[#214A27] text-white px-4 py-2  hover:bg-green-600 transition"
          onClick={toggleForm}>
          Add New Club
        </button>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col space-y-4 bg-gray-100 p-6 rounded shadow-xl border border-gray-300">
          <h2 className="text-lg font-semibold text-center">Add New Club</h2>
          <h4>Please enter the club details below.</h4>
          <div className="">
            {/* Golf club name & address*/}
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2">
                  Golf Club Name
                </label>
                <input
                  type="text"
                  name="clubName"
                  value={formData.clubName}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                  placeholder="Club Name (without 'Golf Club')"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2">
                  Golf Club Address
                </label>
                <input
                  type="text"
                  name="clubAddress"
                  value={formData.clubAddress}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                  placeholder="Street, Town & Postcode"
                />
              </div>
            </div>

            {/* Club website */}
            <div className="mt-4">
              <label className="text-sm font-medium mb-2">Club Website</label>
              <input
                type="text"
                name="clubURL"
                value={formData.clubURL}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Enter Website URL"
              />
            </div>
            <div className="flex space-x-4 mt-4">
              {/* Club contact number */}
              <div className="flex-1">
                <label className="text-sm font-medium mb-2">
                  Club Contact Number
                </label>
                <input
                  type="number"
                  name="clubContactNumber"
                  value={formData.clubContactNumber}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Enter contact number"
                />
              </div>

              {/* Club ID */}
              <div className="flex-1">
                <label className="text-sm font-medium mb-2">Club ID</label>
                <input
                  type="text"
                  name="clubID"
                  value={formData.clubID}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Enter club ID, e.g 'BUL / OP'"
                />
              </div>
            </div>

            {/* Club Pro */}
            <div className="mt-4">
              <label className="text-sm font-medium mb-2">
                Club Professional
              </label>
              <input
                type="text"
                name="proName"
                value={formData.proName}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Enter Club Professional Name"
              />
            </div>

            <div className="flex space-x-4 mt-4">
              {/* Club image & logo */}
              <div className="flex-1">
                <label className="text-sm font-medium mb-2">Club Image</label>
                <input
                  type="file"
                  name="clubImage"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0]
                    if (file) {
                      console.log("Selected file:", file)
                      setFormData((prev) => ({
                        ...prev,
                        clubImage: file,
                      }))
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2">Club Logo</label>
                <input
                  type="file"
                  name="clubLogo"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0]
                    if (file) {
                      console.log("Selected file:", file)
                      setFormData((prev) => ({
                        ...prev,
                        clubLogo: file,
                      }))
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
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
      )}
    </div>
  )
}

export default AddClub
