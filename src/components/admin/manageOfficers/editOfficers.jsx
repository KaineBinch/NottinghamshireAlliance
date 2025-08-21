import { useState, useEffect } from "react"
import {
  getAllOfficers,
  getOfficerById,
  updateOfficer,
} from "../../../utils/api/officersApi"
import { getAllGolfClubs } from "../../../utils/api/clubsApi"
import { formatClubName } from "../../../utils/formatClubName"
import { OFFICER_POSITIONS } from "../../../constants/officerPositions"

const EditOfficer = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState("select") // "select" or "edit"
  const [officers, setOfficers] = useState([])
  const [selectedOfficer, setSelectedOfficer] = useState(null)
  const [golfClubs, setGolfClubs] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")
  const [validationErrors, setValidationErrors] = useState([])
  const [realtimeWarnings, setRealtimeWarnings] = useState([])
  const [formData, setFormData] = useState({
    Name: "",
    Positions: "",
    golfClubDocumentId: "",
  })

  // Load all officers on component mount
  useEffect(() => {
    const loadOfficers = async () => {
      setIsLoading(true)
      try {
        const [officersData, clubsData] = await Promise.all([
          getAllOfficers(),
          getAllGolfClubs(),
        ])

        // Sort officers by golf club name, then by officer name
        const sortedOfficers = officersData.sort((a, b) => {
          const clubA = (a.golf_club?.clubName || "").toLowerCase()
          const clubB = (b.golf_club?.clubName || "").toLowerCase()
          if (clubA !== clubB) {
            return clubA.localeCompare(clubB)
          }
          // If same club, sort by officer name
          const nameA = (a.Name || "").toLowerCase()
          const nameB = (b.Name || "").toLowerCase()
          return nameA.localeCompare(nameB)
        })

        setOfficers(sortedOfficers)
        setGolfClubs(clubsData)
        console.log("Loaded officers for editing:", sortedOfficers)
      } catch (error) {
        console.error("Error loading officers:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadOfficers()
  }, [])

  const handleOfficerSelect = async (officerId) => {
    try {
      setIsLoading(true)
      const officer = await getOfficerById(officerId)
      setSelectedOfficer(officer)

      // Populate form with existing data
      setFormData({
        Name: officer.Name || "",
        Positions: officer.Positions || "",
        golfClubDocumentId:
          officer.golf_club?.documentId || officer.golf_club?.id || "",
      })

      setStep("edit")
      console.log("Selected officer for editing:", officer)
    } catch (error) {
      console.error("Error loading officer details:", error)
      setSubmitMessage(`❌ Error loading officer details: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Real-time validation as user types
  const checkRealtimeConflicts = (fieldName, value) => {
    if (!value || officers.length === 0 || !formData.golfClubDocumentId) {
      setRealtimeWarnings([])
      return
    }

    const warnings = []
    const normalizedValue = value.toLowerCase().trim()

    officers.forEach((officer) => {
      // Skip validation for the officer being edited
      if (
        officer.documentId === selectedOfficer?.documentId ||
        officer.id === selectedOfficer?.id
      ) {
        return
      }

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
      console.log("Updating officer data:", formData)
      const result = await updateOfficer(
        selectedOfficer.documentId || selectedOfficer.id,
        formData
      )
      console.log("Officer updated successfully:", result)

      setSubmitMessage(
        `✅ Officer "${formData.Name}" has been successfully updated!`
      )

      // Call success callback
      if (onSuccess) {
        onSuccess(result)
      }
    } catch (error) {
      console.error("Error updating officer:", error)

      if (error.validationErrors) {
        setValidationErrors(error.validationErrors)
        setSubmitMessage("❌ Please fix the validation errors above.")
      } else {
        setSubmitMessage(`❌ Error updating officer: ${error.message}`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    setStep("select")
    setSelectedOfficer(null)
    setFormData({
      Name: "",
      Positions: "",
      golfClubDocumentId: "",
    })
    setValidationErrors([])
    setRealtimeWarnings([])
    setSubmitMessage("")
  }

  const handleCancel = () => {
    if (onClose) {
      onClose()
    }
  }

  // Officer selection step
  if (step === "select") {
    return (
      <div className="space-y-4 bg-gray-100 p-6 rounded-lg shadow-lg border border-gray-300">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Select Officer to Edit
        </h2>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#214A27] mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading officers...</p>
          </div>
        ) : officers.length > 0 ? (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {officers.map((officer) => (
              <div
                key={officer.id || officer.documentId}
                className="border border-gray-300 hover:bg-green-50 rounded-lg p-4 cursor-pointer transition-colors bg-white"
                onClick={() =>
                  handleOfficerSelect(officer.documentId || officer.id)
                }>
                <h4 className="font-bold text-gray-800">{officer.Name}</h4>
                <p className="text-sm text-gray-600">{officer.Positions}</p>
                <p className="text-xs text-gray-500">
                  Club: {officer.golf_club?.clubName || "Unknown Club"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600">No officers found</p>
        )}

        <div className="flex justify-center mt-4">
          <button
            className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition duration-300"
            onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // Edit form step
  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-gray-100 p-6 rounded-lg shadow-lg border border-gray-300">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
        Edit Officer: {selectedOfficer?.Name}
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
          onClick={handleBack}
          className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition duration-300"
          disabled={isSubmitting}>
          Back
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-[#214A27] text-white rounded hover:bg-green-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}>
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Updating...</span>
            </div>
          ) : (
            "Update Officer"
          )}
        </button>
      </div>
    </form>
  )
}

export default EditOfficer
