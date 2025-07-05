import { useState, useEffect } from "react"
import { createGolfClub, getAllGolfClubs } from "../../../utils/api/clubsApi"

const AddClub = ({ onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")
  const [validationErrors, setValidationErrors] = useState([])
  const [existingClubs, setExistingClubs] = useState([])
  const [realtimeWarnings, setRealtimeWarnings] = useState([])
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

  // Load existing clubs for real-time validation
  useEffect(() => {
    const loadExistingClubs = async () => {
      try {
        const clubs = await getAllGolfClubs()
        setExistingClubs(clubs)
        console.log("Loaded existing clubs:", clubs) // Debug log
      } catch (error) {
        console.error("Error loading existing clubs:", error)
      }
    }
    loadExistingClubs()
  }, [])

  // Real-time validation as user types
  const checkRealtimeConflicts = (fieldName, value) => {
    if (!value || existingClubs.length === 0) {
      setRealtimeWarnings([])
      return
    }

    const warnings = []
    const normalizedValue = value.toLowerCase().trim()

    existingClubs.forEach((club) => {
      // FIX: Access club data directly, not through .attributes
      // The data structure is: club.clubName, not club.attributes.clubName

      switch (fieldName) {
        case "clubName":
          if (club.clubName?.toLowerCase().trim() === normalizedValue) {
            warnings.push(`Club name "${value}" is already taken`)
          }
          break
        case "clubAddress":
          if (club.clubAddress?.toLowerCase().trim() === normalizedValue) {
            warnings.push(`This address is already registered`)
          }
          break
        case "clubURL":
          if (club.clubURL?.toLowerCase().trim() === normalizedValue) {
            warnings.push(`This website URL is already registered`)
          }
          break
        case "clubContactNumber":
          if (
            club.clubContactNumber?.toString().trim() ===
            value.toString().trim()
          ) {
            warnings.push(`This contact number is already registered`)
          }
          break
        case "clubID":
          if (club.clubID?.toLowerCase().trim() === normalizedValue) {
            warnings.push(`Club ID "${value}" is already taken`)
          }
          break
      }
    })

    setRealtimeWarnings(warnings)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([])
      setSubmitMessage("")
    }

    // Check for real-time conflicts
    checkRealtimeConflicts(name, value)
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

  const resetForm = () => {
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
        "❌ Please resolve the conflicts above before submitting"
      )
      return
    }

    setIsSubmitting(true)
    setSubmitMessage("")
    setValidationErrors([])

    console.log("Form submission started...")

    try {
      // Prepare form data for submission
      const submitData = {
        ...formData,
        // Convert contact number to string if needed
        clubContactNumber: formData.clubContactNumber.toString(),
      }

      console.log("Creating golf club:", submitData)

      // Send to Strapi API - the function will handle validation and files automatically
      const result = await createGolfClub(submitData)

      console.log("Golf club created successfully:", result)
      setSubmitMessage("✅ Golf club created successfully!")

      // Reset form data but keep message
      resetForm()

      // Reload existing clubs after successful creation
      const updatedClubs = await getAllGolfClubs()
      setExistingClubs(updatedClubs)

      // Close form after a brief delay to show success message
      setTimeout(() => {
        setSubmitMessage("")
        if (onClose) onClose()
        if (onSuccess) onSuccess(result)
      }, 2000)
    } catch (error) {
      console.error("Error creating golf club:", error)

      // Handle validation errors specifically
      if (error.validationErrors && Array.isArray(error.validationErrors)) {
        setValidationErrors(error.validationErrors)
        setSubmitMessage("❌ Club information conflicts found:")
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

        const fullErrorMessage = `❌ Error creating golf club: ${errorMessage}`
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

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-gray-100 p-6 rounded-lg shadow-lg border border-gray-300">
      <h3 className="text-lg font-medium text-center text-gray-800">
        New Golf Club Details
      </h3>
      <p className="text-sm text-gray-600 text-center mb-4">
        Please fill in the club information below
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
            ⚠️ Potential Conflicts Detected:
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
            className={`w-full p-3 border rounded focus:ring-2 focus:ring-[#214A27] focus:border-transparent ${
              realtimeWarnings.some((w) => w.includes("Club name"))
                ? "border-yellow-400 bg-yellow-50"
                : "border-gray-300"
            }`}
            placeholder="e.g., Bulwell Forest"
            required
            disabled={isSubmitting}
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter name without &quot;Golf Club&quot;
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
            className={`w-full p-3 border rounded focus:ring-2 focus:ring-[#214A27] focus:border-transparent ${
              realtimeWarnings.some((w) => w.includes("address"))
                ? "border-yellow-400 bg-yellow-50"
                : "border-gray-300"
            }`}
            placeholder="Street, Town, Postcode"
            required
            disabled={isSubmitting}
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter Street, Town & Postcode
          </p>
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
          className={`w-full p-3 border rounded focus:ring-2 focus:ring-[#214A27] focus:border-transparent ${
            realtimeWarnings.some((w) => w.includes("website"))
              ? "border-yellow-400 bg-yellow-50"
              : "border-gray-300"
          }`}
          placeholder="https://www.clubwebsite.com"
          disabled={isSubmitting}
        />
        <p className="text-xs text-gray-500 mt-1">
          This website URL needs to have https:// in front of the www.
        </p>
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
            className={`w-full p-3 border rounded focus:ring-2 focus:ring-[#214A27] focus:border-transparent ${
              realtimeWarnings.some((w) => w.includes("contact number"))
                ? "border-yellow-400 bg-yellow-50"
                : "border-gray-300"
            }`}
            placeholder="01234 567890"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Club ID *
          </label>
          <input
            type="text"
            name="clubID"
            value={formData.clubID}
            onChange={handleChange}
            className={`w-full p-3 border rounded focus:ring-2 focus:ring-[#214A27] focus:border-transparent ${
              realtimeWarnings.some((w) => w.includes("Club ID"))
                ? "border-yellow-400 bg-yellow-50"
                : "border-gray-300"
            }`}
            placeholder="e.g., BUL, OP, etc."
            required
            disabled={isSubmitting}
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
          disabled={isSubmitting}
        />
        <p className="text-xs text-gray-500 mt-1">
          Multiple clubs can share the same professional
        </p>
      </div>

      {/* Image Upload Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Club Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Club Image
          </label>
          <div className="relative">
            <input
              type="file"
              id="clubImage"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={(e) => handleFileChange(e, "clubImage")}
              className="hidden"
              disabled={isSubmitting}
            />
            <label
              htmlFor="clubImage"
              className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ${
                formData.clubImage
                  ? "border-green-400 bg-green-50"
                  : "border-gray-300 hover:border-[#214A27] hover:bg-gray-50"
              } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}>
              {formData.clubImage ? (
                <div className="text-center">
                  <div className="text-green-600 mb-1">
                    <svg
                      className="w-8 h-8 mx-auto"
                      fill="currentColor"
                      viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-green-700 font-medium">
                    {formData.clubImage.name}
                  </p>
                  <p className="text-xs text-green-600">
                    {(formData.clubImage.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-gray-400 mb-2">
                    <svg
                      className="w-8 h-8 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600">
                    Click to upload club image
                  </p>
                  <p className="text-xs text-gray-400">
                    JPEG, PNG, WebP (max 5MB)
                  </p>
                </div>
              )}
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Optional: Main image showcasing the golf course
          </p>
        </div>

        {/* Club Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Club Logo
          </label>
          <div className="relative">
            <input
              type="file"
              id="clubLogo"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={(e) => handleFileChange(e, "clubLogo")}
              className="hidden"
              disabled={isSubmitting}
            />
            <label
              htmlFor="clubLogo"
              className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ${
                formData.clubLogo
                  ? "border-green-400 bg-green-50"
                  : "border-gray-300 hover:border-[#214A27] hover:bg-gray-50"
              } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}>
              {formData.clubLogo ? (
                <div className="text-center">
                  <div className="text-green-600 mb-1">
                    <svg
                      className="w-8 h-8 mx-auto"
                      fill="currentColor"
                      viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-green-700 font-medium">
                    {formData.clubLogo.name}
                  </p>
                  <p className="text-xs text-green-600">
                    {(formData.clubLogo.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-gray-400 mb-2">
                    <svg
                      className="w-8 h-8 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600">
                    Click to upload club logo
                  </p>
                  <p className="text-xs text-gray-400">
                    JPEG, PNG, WebP (max 5MB)
                  </p>
                </div>
              )}
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Optional: Club&#39;s official logo or emblem
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          className="px-6 py-2 border border-gray-300 rounded text-white bg-red-600 hover:bg-red-700 transition duration-300"
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
            "Create Golf Club"
          )}
        </button>
      </div>
    </form>
  )
}

export default AddClub
