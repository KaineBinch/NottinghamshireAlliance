import { useState } from "react"

const ManageClubs = () => {
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

  const toggleForm = () => {
    setIsFormOpen((prev) => !prev)
    // Reset form when closing
    if (isFormOpen) {
      setFormData({
        clubName: "",
        clubAddress: "",
        clubURL: "",
        clubContactNumber: "",
        clubID: "",
        proName: "",
        clubImage: null,
        clubLogo: null,
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

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
      if (!validTypes.includes(file.type)) {
        alert("Please select a valid image file (JPEG, PNG, or WebP)")
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB")
        return
      }

      console.log(`Selected ${fieldName}:`, file)
      setFormData((prev) => ({
        ...prev,
        [fieldName]: file,
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Prepare form data for submission
    const submitData = {
      ...formData,
      // Convert contact number to string if needed
      clubContactNumber: formData.clubContactNumber.toString(),
    }

    console.log("Club form submitted:", submitData)

    // TODO: Send to Strapi API with file uploads
    // const formDataToSend = new FormData()
    // Object.keys(submitData).forEach(key => {
    //   if (submitData[key] !== null) {
    //     formDataToSend.append(key, submitData[key])
    //   }
    // })
    // await createClub(formDataToSend)

    // Reset form and close
    setFormData({
      clubName: "",
      clubAddress: "",
      clubURL: "",
      clubContactNumber: "",
      clubID: "",
      proName: "",
      clubImage: null,
      clubLogo: null,
    })
    setIsFormOpen(false)
  }

  return (
    <div className="h-full flex flex-col space-y-4 bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-lg font-semibold text-center text-white bg-[#214A27] -m-6 mb-4 p-4 rounded-t-lg">
        Manage Golf Clubs
      </h2>

      {!isFormOpen ? (
        <div className="text-center">
          <p className="mb-6 text-gray-700">
            Add new golf clubs to the alliance. Each club can host events and
            have members participate in competitions.
          </p>
          <button
            className="bg-[#214A27] text-white px-6 py-3 rounded hover:bg-green-600 transition duration-300 font-medium"
            onClick={toggleForm}>
            Add New Golf Club
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-lg font-medium text-center text-gray-800">
            New Golf Club Details
          </h3>
          <p className="text-sm text-gray-600 text-center mb-4">
            Please fill in the club information below
          </p>

          {/* Club Name and Address Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Club Name *
              </label>
              <input
                type="text"
                name="clubName"
                value={formData.clubName}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#214A27] focus:border-transparent"
                placeholder="e.g., Bulwell Forest"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter name without "Golf Club"
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Club Address *
              </label>
              <input
                type="text"
                name="clubAddress"
                value={formData.clubAddress}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#214A27] focus:border-transparent"
                placeholder="Street, Town, Postcode"
                required
              />
            </div>
          </div>

          {/* Club URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Club Website
            </label>
            <input
              type="url"
              name="clubURL"
              value={formData.clubURL}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#214A27] focus:border-transparent"
              placeholder="https://www.clubwebsite.com"
            />
          </div>

          {/* Contact Number and Club ID Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number
              </label>
              <input
                type="tel"
                name="clubContactNumber"
                value={formData.clubContactNumber}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#214A27] focus:border-transparent"
                placeholder="01234 567890"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Club ID
              </label>
              <input
                type="text"
                name="clubID"
                value={formData.clubID}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#214A27] focus:border-transparent"
                placeholder="e.g., BUL, OP, etc."
              />
              <p className="text-xs text-gray-500 mt-1">
                Short identifier for the club
              </p>
            </div>
          </div>

          {/* Club Professional */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Club Professional
            </label>
            <input
              type="text"
              name="proName"
              value={formData.proName}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#214A27] focus:border-transparent"
              placeholder="Professional's name"
            />
          </div>

          {/* Image Uploads Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Club Image
              </label>
              <input
                type="file"
                name="clubImage"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={(e) => handleFileChange(e, "clubImage")}
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#214A27] focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-[#214A27] file:text-white hover:file:bg-green-600"
              />
              <p className="text-xs text-gray-500 mt-1">
                Course photo (max 5MB, JPEG/PNG/WebP)
              </p>
              {formData.clubImage && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ {formData.clubImage.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Club Logo
              </label>
              <input
                type="file"
                name="clubLogo"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={(e) => handleFileChange(e, "clubLogo")}
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#214A27] focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-[#214A27] file:text-white hover:file:bg-green-600"
              />
              <p className="text-xs text-gray-500 mt-1">
                Club logo (max 5MB, JPEG/PNG/WebP)
              </p>
              {formData.clubLogo && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ {formData.clubLogo.name}
                </p>
              )}
            </div>
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
              Create Golf Club
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default ManageClubs
