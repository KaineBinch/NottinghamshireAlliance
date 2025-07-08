import { useState, useEffect } from "react"
import { createOfficer, getAllOfficers } from "../../../utils/api/officersApi"
import { getAllGolfClubs } from "../../../utils/api/clubsApi"

const AddOfficer = ({ onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")
  const [validationErrors, setValidationErrors] = useState([])
  const [existingOfficers, setExistingOfficers] = useState([])
  const [realtimeWarnings, setRealtimeWarnings] = useState([])
  const [golfClubs, setGolfClubs] = useState([])
  const [formData, setFormData] = useState({
    Name: "",
    Positions: "",
    golfClubDocumentId: "",
  })

  // Load existing officers and golf clubs for validation and selection
  useEffect(() => {
    const loadData = async () => {
      try {
        const [officers, clubs] = await Promise.all([
          getAllOfficers(),
          getAllGolfClubs(),
        ])
        setExistingOfficers(officers)
        setGolfClubs(clubs)
        console.log("Loaded existing officers:", officers) // Debug log
        console.log("Loaded golf clubs:", clubs) // Debug log
      } catch (error) {
        console.error("Error loading data:", error)
      }
    }
    loadData()
  }, [])

  // Real-time validation as user types
  const checkRealtimeConflicts = (fieldName, value) => {
    if (
      !value ||
      existingOfficers.length === 0 ||
      !formData.golfClubDocumentId
    ) {
      setRealtimeWarnings([])
      return
    }

    const warnings = []
    const normalizedValue = value.toLowerCase().trim()

    existingOfficers.forEach((officer) => {
      switch (fieldName) {
        case "Name":
          if (
            officer.Name?.toLowerCase().trim() === normalizedValue &&
            officer.golf_club?.documentId === formData.golfClubDocumentId
          ) {
            warnings.push(
              `⚠️ Officer "${value}" already exists for this golf club`
            )
          }
          break
        default:
          break
      }
    })

    setRealtimeWarnings(warnings)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    // Clear validation errors when user starts typing
    setValidationErrors([])
    setSubmitMessage("")

    // Run real-time validation for name field
    if (name === "Name") {
      checkRealtimeConflicts(name, value)
    }
  }

  // Re-run validation when golf club changes
  useEffect(() => {
    if (formData.Name && formData.golfClubDocumentId) {
      checkRealtimeConflicts("Name", formData.Name)
    }
  }, [formData.golfClubDocumentId])

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Basic validation
    const errors = []
    if (!formData.Name.trim()) {
      errors.push("Officer name is required")
    }
    if (!formData.Positions.trim()) {
      errors.push("Position(s) are required")
    }
    if (!formData.golfClubDocumentId) {
      errors.push("Please select a golf club")
    }

    if (errors.length > 0) {
      setValidationErrors(errors)
      return
    }

    setIsSubmitting(true)
    setSubmitMessage("")

    try {
      console.log("Submitting officer data:", formData)
      const result = await createOfficer(formData)
      console.log("Officer created successfully:", result)

      setSubmitMessage(
        `✅ Officer "${formData.Name}" has been successfully added!`
      )

      // Call success callback
      if (onSuccess) {
        onSuccess(result)
      }
    } catch (error) {
      console.error("Error creating officer:", error)

      if (error.validationErrors) {
        setValidationErrors(error.validationErrors)
        setSubmitMessage("❌ Please fix the validation errors above.")
      } else if (error.response?.data?.error?.message) {
        setSubmitMessage(`❌ Error: ${error.response.data.error.message}`)
      } else {
        setSubmitMessage(`❌ Failed to create officer: ${error.message}`)
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

  const selectedClub = golfClubs.find(
    (club) =>
      club.documentId === formData.golfClubDocumentId ||
      club.id === formData.golfClubDocumentId
  )

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-gray-100 p-6 rounded-lg shadow-lg border border-gray-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-800">Add New Officer</h3>
        <button
          type="button"
          onClick={handleCancel}
          className="text-gray-500 hover:text-gray-700">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Show validation errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-4">
          <h4 className="font-bold mb-2">Please fix these errors:</h4>
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
        <div className="bg-yellow-100 border border-yellow-300 text-yellow-700 px-4 py-3 rounded mb-4">
          <h4 className="font-bold mb-2">Warnings:</h4>
          <ul className="list-disc list-inside space-y-1">
            {realtimeWarnings.map((warning, index) => (
              <li key={index} className="text-sm">
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

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

      {/* Golf Club Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Golf Club *
        </label>
        <select
          name="golfClubDocumentId"
          value={formData.golfClubDocumentId}
          onChange={handleInputChange}
          className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#214A27] focus:border-transparent"
          required
          disabled={isSubmitting}>
          <option value="">Select a golf club...</option>
          {golfClubs.map((club) => (
            <option
              key={club.documentId || club.id}
              value={club.documentId || club.id}>
              {club.clubName} ({club.clubID})
            </option>
          ))}
        </select>
      </div>

      {/* Selected Club Info */}
      {selectedClub && (
        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <p className="text-sm text-blue-800">
            <strong>Selected Club:</strong> {selectedClub.clubName}
          </p>
          {selectedClub.clubAddress && (
            <p className="text-xs text-blue-600">{selectedClub.clubAddress}</p>
          )}
        </div>
      )}

      {/* Officer Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Officer Name *
        </label>
        <input
          type="text"
          name="Name"
          value={formData.Name}
          onChange={handleInputChange}
          className={`w-full p-3 border rounded focus:ring-2 focus:ring-[#214A27] focus:border-transparent ${
            realtimeWarnings.some((w) => w.includes("Officer"))
              ? "border-yellow-400 bg-yellow-50"
              : "border-gray-300"
          }`}
          placeholder="Enter officer's full name"
          required
          disabled={isSubmitting}
        />
      </div>

      {/* Officer Positions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Position(s) *
        </label>
        <input
          type="text"
          name="Positions"
          value={formData.Positions}
          onChange={handleInputChange}
          className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#214A27] focus:border-transparent"
          placeholder="e.g., Captain, Secretary, Treasurer"
          required
          disabled={isSubmitting}
        />
        <p className="text-xs text-gray-500 mt-1">
          Multiple positions can be separated by commas
        </p>
      </div>

      {/* Submit and Cancel buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={handleCancel}
          className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition duration-300"
          disabled={isSubmitting}>
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-[#214A27] text-white rounded hover:bg-green-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}>
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Adding...</span>
            </div>
          ) : (
            "Add Officer"
          )}
        </button>
      </div>
    </form>
  )
}

export default AddOfficer
