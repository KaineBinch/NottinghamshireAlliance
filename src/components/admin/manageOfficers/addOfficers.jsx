import { useState, useEffect } from "react"
import { createOfficer, getAllOfficers } from "../../../utils/api/officersApi"
import { getAllGolfClubs } from "../../../utils/api/clubsApi"
import { formatClubName } from "../../../utils/formatClubName"
import { OFFICER_POSITIONS } from "../../../constants/officerPositions"

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
        console.log("Loaded existing officers:", officers)
        console.log("Loaded golf clubs:", clubs)
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
      errors.push("Position is required")
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
      } else {
        setSubmitMessage(`❌ Error adding officer: ${error.message}`)
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
      className="space-y-6 bg-gray-100 p-6 rounded-lg shadow-lg border border-gray-300">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
        Add New Officer
      </h2>

      {/* Display validation errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <h4 className="font-medium text-red-800 mb-2">
            Please fix the following errors:
          </h4>
          <ul className="list-disc list-inside text-red-700 space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Display realtime warnings */}
      {realtimeWarnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
          <ul className="text-yellow-700 space-y-1">
            {realtimeWarnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Submit message */}
      {submitMessage && (
        <div
          className={`text-center p-3 rounded ${
            submitMessage.includes("✅")
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
          {submitMessage}
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
              {formatClubName(club.clubName)}
            </option>
          ))}
        </select>
      </div>

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
            realtimeWarnings.length > 0
              ? "border-yellow-400 bg-yellow-50"
              : "border-gray-300"
          }`}
          placeholder="Enter officer's full name"
          required
          disabled={isSubmitting}
        />
      </div>

      {/* Officer Position - Updated to dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Position *
        </label>
        <select
          name="Positions"
          value={formData.Positions}
          onChange={handleInputChange}
          className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#214A27] focus:border-transparent"
          required
          disabled={isSubmitting}>
          <option value="">Select a position...</option>
          {OFFICER_POSITIONS.map((position) => (
            <option key={position} value={position}>
              {position}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Choose the officer&apos;s primary position
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
