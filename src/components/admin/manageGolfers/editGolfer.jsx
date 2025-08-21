import { useState, useEffect } from "react"
import {
  getAllGolfers,
  getGolferById,
  updateGolfer,
} from "../../../utils/api/golfersApi"
import { formatClubName } from "../../../utils/formatClubName"
import { getAllGolfClubs } from "../../../utils/api/clubsApi"

const EditGolfer = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState("select") // "select" or "edit"
  const [golfers, setGolfers] = useState([])
  const [selectedGolfer, setSelectedGolfer] = useState(null)
  const [golfClubs, setGolfClubs] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")
  const [validationErrors, setValidationErrors] = useState([])
  const [realtimeWarnings, setRealtimeWarnings] = useState([])
  const [formData, setFormData] = useState({
    golferName: "",
    isPro: false,
    isSenior: false,
    golfClubDocumentId: "",
  })

  // Load all golfers on component mount
  useEffect(() => {
    const loadGolfers = async () => {
      setIsLoading(true)
      try {
        const golfersData = await getAllGolfers()
        // Sort golfers alphabetically by golfer name (A-Z)
        const sortedGolfers = golfersData.sort((a, b) => {
          const nameA = (a.golferName || "").toLowerCase()
          const nameB = (b.golferName || "").toLowerCase()
          return nameA.localeCompare(nameB)
        })
        setGolfers(sortedGolfers)
      } catch (error) {
        console.error("Error loading golfers:", error)
        setSubmitMessage("❌ Error loading golfers")
      } finally {
        setIsLoading(false)
      }
    }
    loadGolfers()
  }, [])

  // Load golf clubs when needed
  useEffect(() => {
    if (step === "edit") {
      const loadGolfClubs = async () => {
        try {
          const clubsData = await getAllGolfClubs()
          setGolfClubs(clubsData)
        } catch (error) {
          console.error("Error loading golf clubs:", error)
        }
      }
      loadGolfClubs()
    }
  }, [step])

  // Real-time validation as user types (excluding current golfer)
  const checkRealtimeConflicts = (fieldName, value) => {
    if (!value || golfers.length === 0) {
      setRealtimeWarnings([])
      return
    }

    const warnings = []
    const normalizedValue = value.toLowerCase().trim()

    golfers.forEach((golfer) => {
      // Skip validation for the golfer being edited
      if (
        selectedGolfer &&
        (golfer.id === selectedGolfer.id ||
          golfer.documentId === selectedGolfer.documentId)
      ) {
        return
      }

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

  const handleGolferSelect = async (golferId) => {
    if (!golferId) return

    setIsLoading(true)
    try {
      const golferData = await getGolferById(golferId)
      setSelectedGolfer(golferData)

      // Populate form with existing data
      setFormData({
        golferName: golferData.golferName || "",
        isPro: golferData.isPro || false,
        isSenior: golferData.isSenior || false,
        golfClubDocumentId:
          golferData.golf_club?.documentId || golferData.golf_club?.id || "",
      })

      setStep("edit")
    } catch (error) {
      console.error("Error loading golfer details:", error)
      setSubmitMessage("❌ Error loading golfer details")
    } finally {
      setIsLoading(false)
    }
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
      const result = await updateGolfer(
        selectedGolfer.id || selectedGolfer.documentId,
        {
          golferName: formData.golferName.trim(),
          isPro: formData.isPro,
          isSenior: formData.isSenior,
          golfClubDocumentId: formData.golfClubDocumentId,
        }
      )

      console.log("Golfer updated successfully:", result)
      setSubmitMessage("✅ Golfer updated successfully!")

      // Call parent success handler
      if (onSuccess) {
        onSuccess(result)
      }
    } catch (error) {
      console.error("Error updating golfer:", error)

      if (error.validationErrors) {
        setValidationErrors(error.validationErrors)
        setSubmitMessage("❌ Please fix the validation errors below")
      } else {
        setSubmitMessage("❌ Failed to update golfer. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    setStep("select")
    setSelectedGolfer(null)
    setSubmitMessage("")
    setValidationErrors([])
    setRealtimeWarnings([])
    setFormData({
      golferName: "",
      isPro: false,
      isSenior: false,
      golfClubDocumentId: "",
    })
  }

  const handleCancel = () => {
    if (onClose) {
      onClose()
    }
  }

  // Selection step
  if (step === "select") {
    return (
      <div className="space-y-4 bg-gray-100 p-6 rounded-lg shadow-lg border border-gray-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-800">
            Select Golfer to Edit
          </h3>
        </div>

        {/* Show submit message */}
        {submitMessage && (
          <div className="bg-red-100 text-red-700 border border-red-300 rounded p-3 mb-4">
            <div className="font-medium">{submitMessage}</div>
          </div>
        )}

        {/* Golfers list */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#214A27] mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading golfers...</p>
          </div>
        ) : golfers.length > 0 ? (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {golfers.map((golfer) => (
              <div
                key={golfer.id || golfer.documentId}
                className="border border-gray-300 hover:bg-green-50 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors bg-gray-200"
                onClick={() =>
                  handleGolferSelect(golfer.documentId || golfer.id)
                }>
                <h4 className="font-bold text-gray-800">{golfer.golferName}</h4>
                <p className="text-sm text-gray-600">
                  Club: {golfer.golf_club?.clubName || "No club assigned"}
                </p>
                <div className="text-xs text-gray-500 flex gap-2">
                  {golfer.isPro && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Pro
                    </span>
                  )}
                  {golfer.isSenior && (
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      Senior
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600">No golfers found</p>
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

  // Edit form (similar to AddGolfer but with existing data)
  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-gray-100 p-6 rounded-lg shadow-lg border border-gray-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-800">
          Edit Golfer: {selectedGolfer?.golferName}
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
              {formatClubName(club.clubName)}
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
          onClick={handleBack}
          className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition duration-300">
          Back
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-300 disabled:opacity-50">
          {isSubmitting ? "Updating..." : "Update Golfer"}
        </button>
      </div>
    </form>
  )
}

export default EditGolfer
