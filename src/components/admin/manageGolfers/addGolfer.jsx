import { useState, useEffect } from "react"
import { createGolfer, getAllGolfers } from "../../../utils/api/golfersApi"
import { getAllGolfClubs } from "../../../utils/api/clubsApi"

const AddGolfer = ({ onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")
  const [validationErrors, setValidationErrors] = useState([])
  const [existingGolfers, setExistingGolfers] = useState([])
  const [realtimeWarnings, setRealtimeWarnings] = useState([])
  const [golfClubs, setGolfClubs] = useState([])
  const [formData, setFormData] = useState({
    golferName: "",
    isPro: false,
    isSenior: false,
    golfClubDocumentId: "",
  })

  // Load existing golfers and golf clubs for validation and selection
  useEffect(() => {
    const loadData = async () => {
      try {
        const [golfers, clubs] = await Promise.all([
          getAllGolfers(),
          getAllGolfClubs(),
        ])
        setExistingGolfers(golfers)
        setGolfClubs(clubs)
        console.log("Loaded existing golfers:", golfers) // Debug log
        console.log("Loaded golf clubs:", clubs) // Debug log
      } catch (error) {
        console.error("Error loading data:", error)
      }
    }
    loadData()
  }, [])

  // Real-time validation as user types
  const checkRealtimeConflicts = (fieldName, value) => {
    if (!value || existingGolfers.length === 0) {
      setRealtimeWarnings([])
      return
    }

    const warnings = []
    const normalizedValue = value.toLowerCase().trim()

    existingGolfers.forEach((golfer) => {
      switch (fieldName) {
        case "golferName":
          if (golfer.golferName?.toLowerCase().trim() === normalizedValue) {
            warnings.push(`⚠️ Golfer name "${value}" already exists`)
          }
          break
        default:
          break
      }
    })

    setRealtimeWarnings(warnings)
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === "checkbox" ? checked : value

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }))

    // Clear previous validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([])
    }

    // Clear submit message when user starts typing
    if (submitMessage) {
      setSubmitMessage("")
    }

    // Perform real-time validation for specific fields
    if (name === "golferName") {
      checkRealtimeConflicts(name, value)
    }
  }

  const validateForm = () => {
    const errors = []

    // Required field validation
    if (!formData.golferName?.trim()) {
      errors.push("Golfer name is required")
    }

    if (!formData.golfClubDocumentId) {
      errors.push("Golf club selection is required")
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
      const result = await createGolfer({
        golferName: formData.golferName.trim(),
        isPro: formData.isPro,
        isSenior: formData.isSenior,
        golfClubDocumentId: formData.golfClubDocumentId,
      })

      console.log("Golfer created successfully:", result)
      setSubmitMessage("✅ Golfer added successfully!")

      // Call parent success handler
      if (onSuccess) {
        onSuccess(result)
      }

      // Reset form
      setFormData({
        golferName: "",
        isPro: false,
        isSenior: false,
        golfClubDocumentId: "",
      })
      setRealtimeWarnings([])
    } catch (error) {
      console.error("Error creating golfer:", error)

      if (error.validationErrors) {
        setValidationErrors(error.validationErrors)
        setSubmitMessage("❌ Please fix the validation errors below")
      } else {
        setSubmitMessage("❌ Failed to add golfer. Please try again.")
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
        <h3 className="text-lg font-medium text-gray-800">Add New Golfer</h3>
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

      {/* Golfer Name */}
      <div>
        <label
          htmlFor="golferName"
          className="block text-sm font-medium text-gray-700 mb-1">
          Golfer Name *
        </label>
        <input
          type="text"
          id="golferName"
          name="golferName"
          value={formData.golferName}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Enter golfer's full name"
        />
      </div>

      {/* Golf Club Selection */}
      <div>
        <label
          htmlFor="golfClubDocumentId"
          className="block text-sm font-medium text-gray-700 mb-1">
          Golf Club *
        </label>
        <select
          id="golfClubDocumentId"
          name="golfClubDocumentId"
          value={formData.golfClubDocumentId}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
          <option value="">Select a golf club</option>
          {golfClubs.map((club) => (
            <option
              key={club.documentId || club.id}
              value={club.documentId || club.id}>
              {club.clubName}
            </option>
          ))}
        </select>
      </div>

      {/* Professional Status */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isPro"
          name="isPro"
          checked={formData.isPro}
          onChange={handleInputChange}
          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
        />
        <label htmlFor="isPro" className="ml-2 block text-sm text-gray-700">
          Professional Golfer
        </label>
      </div>

      {/* Senior Status */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isSenior"
          name="isSenior"
          checked={formData.isSenior}
          onChange={handleInputChange}
          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
        />
        <label htmlFor="isSenior" className="ml-2 block text-sm text-gray-700">
          Senior Golfer
        </label>
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={handleCancel}
          className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition duration-300">
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-300 disabled:opacity-50">
          {isSubmitting ? "Adding..." : "Add Golfer"}
        </button>
      </div>
    </form>
  )
}

export default AddGolfer
