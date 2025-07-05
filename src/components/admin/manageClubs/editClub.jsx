import { useState, useEffect } from "react"
import {
  getAllGolfClubs,
  getGolfClubById,
  updateGolfClub,
} from "../../../utils/api/clubsApi"

const EditClub = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState("select") // "select" or "edit"
  const [clubs, setClubs] = useState([])
  const [selectedClub, setSelectedClub] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")
  const [validationErrors, setValidationErrors] = useState([])
  const [realtimeWarnings, setRealtimeWarnings] = useState([])
  const [formData, setFormData] = useState({
    clubName: "",
    clubAddress: "",
    clubURL: "",
    clubContactNumber: "",
    clubID: "",
    proName: "",
  })

  // Load all clubs on component mount
  useEffect(() => {
    const loadClubs = async () => {
      setIsLoading(true)
      try {
        const clubsData = await getAllGolfClubs()
        // Sort clubs alphabetically by club name (A-Z)
        const sortedClubs = clubsData.sort((a, b) => {
          const nameA = (a.clubName || "").toLowerCase()
          const nameB = (b.clubName || "").toLowerCase()
          return nameA.localeCompare(nameB)
        })
        setClubs(sortedClubs)
      } catch (error) {
        console.error("Error loading clubs:", error)
        setSubmitMessage("❌ Error loading clubs")
      } finally {
        setIsLoading(false)
      }
    }
    loadClubs()
  }, [])

  // Real-time validation as user types (excluding current club)
  const checkRealtimeConflicts = (fieldName, value) => {
    if (!value || clubs.length === 0) {
      setRealtimeWarnings([])
      return
    }

    const warnings = []
    const normalizedValue = value.toLowerCase().trim()

    clubs.forEach((club) => {
      // Skip the club being edited - check multiple ID formats
      if (
        selectedClub &&
        (club.id === selectedClub.id ||
          club.documentId === selectedClub.documentId ||
          club.id === selectedClub.documentId ||
          club.documentId === selectedClub.id ||
          club.id?.toString() === selectedClub.id?.toString() ||
          club.documentId?.toString() === selectedClub.documentId?.toString())
      ) {
        return
      }

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

  const handleClubSelect = async (clubId) => {
    if (!clubId) return

    console.log("Selected club ID:", clubId) // Debug log
    setIsLoading(true)
    try {
      const clubData = await getGolfClubById(clubId)
      console.log("Loaded club data:", clubData) // Debug log
      setSelectedClub(clubData)

      // Populate form with existing data
      setFormData({
        clubName: clubData.clubName || "",
        clubAddress: clubData.clubAddress || "",
        clubURL: clubData.clubURL || "",
        clubContactNumber: clubData.clubContactNumber || "",
        clubID: clubData.clubID || "",
        proName: clubData.proName || "",
      })

      setStep("edit")
    } catch (error) {
      console.error("Error loading club details:", error)
      setSubmitMessage("❌ Error loading club details: " + error.message)
    } finally {
      setIsLoading(false)
    }
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

    try {
      const submitData = {
        ...formData,
        clubContactNumber: formData.clubContactNumber.toString(),
      }

      console.log("Updating golf club:", submitData)

      const result = await updateGolfClub(
        selectedClub.id || selectedClub.documentId,
        submitData
      )

      console.log("Golf club updated successfully:", result)
      setSubmitMessage("✅ Golf club updated successfully!")

      // Close form after a brief delay to show success message
      setTimeout(() => {
        setSubmitMessage("")
        if (onClose) onClose()
        if (onSuccess) onSuccess(result)
      }, 2000)
    } catch (error) {
      console.error("Error updating golf club:", error)

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

        const fullErrorMessage = `❌ Error updating golf club: ${errorMessage}`
        setSubmitMessage(fullErrorMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    setStep("select")
    setSelectedClub(null)
    setFormData({
      clubName: "",
      clubAddress: "",
      clubURL: "",
      clubContactNumber: "",
      clubID: "",
      proName: "",
    })
    setValidationErrors([])
    setRealtimeWarnings([])
    setSubmitMessage("")
  }

  const handleCancel = () => {
    handleBack()
    if (onClose) onClose()
  }

  if (step === "select") {
    return (
      <div className="space-y-4 bg-gray-100 p-6 rounded-lg shadow-lg border border-gray-300">
        <h3 className="text-lg font-medium text-center text-gray-800">
          Select Golf Club to Edit
        </h3>
        <p className="text-sm text-gray-600 text-center mb-4">
          Choose which club you want to edit from the list below (sorted A-Z)
        </p>

        {submitMessage && (
          <div className="text-center p-3 rounded mb-4 bg-red-100 text-red-700 border border-red-300">
            <div className="font-medium">{submitMessage}</div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#214A27] mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading clubs...</p>
          </div>
        ) : clubs.length > 0 ? (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {clubs.map((club) => (
              <div
                key={club.id || club.documentId}
                className="border border-gray-300 hover:bg-green-50 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors bg-gray-200"
                onClick={() => handleClubSelect(club.documentId || club.id)}>
                <h4 className="font-bold text-gray-800">{club.clubName}</h4>
                <p className="text-sm text-gray-600">{club.clubAddress}</p>
                <p className="text-xs text-gray-500">Club ID: {club.clubID}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600">No clubs found</p>
        )}

        <div className="flex justify-center mt-4">
          <button
            className="px-6 py-2 border border-gray-300 rounded text-white bg-red-600 hover:bg-red-700 transition duration-300"
            onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // Edit form (similar to AddClub but with existing data)
  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-gray-100 p-6 rounded-lg shadow-lg border border-gray-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-800">
          Edit Golf Club: {selectedClub?.clubName}
        </h3>
        <button
          type="button"
          onClick={handleBack}
          className="text-sm text-blue-600 hover:text-blue-800">
          ← Back to Selection
        </button>
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
        </div>
      )}

      {/* Form fields - same as AddClub but with dynamic highlighting */}
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
        </div>
      </div>

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
      </div>

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
        </div>
      </div>

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
          className={`px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
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
              Updating...
            </span>
          ) : (
            "Update Golf Club"
          )}
        </button>
      </div>
    </form>
  )
}

export default EditClub
