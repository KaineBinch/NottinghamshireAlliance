import { useState, useEffect } from "react"
import {
  getAllOfficers,
  getOfficerById,
  deleteOfficer,
  checkOfficerDeletionSafety,
} from "../../../utils/api/officersApi"

const DeleteOfficer = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState("select") // "select", "confirm", or "deleting"
  const [officers, setOfficers] = useState([])
  const [selectedOfficer, setSelectedOfficer] = useState(null)
  const [safetyCheck, setSafetyCheck] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")

  // Load all officers on component mount
  useEffect(() => {
    const loadOfficers = async () => {
      setIsLoading(true)
      try {
        const officersData = await getAllOfficers()

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
        console.log("Loaded officers for deletion:", sortedOfficers)
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
      const [officer, safety] = await Promise.all([
        getOfficerById(officerId),
        checkOfficerDeletionSafety(officerId),
      ])

      setSelectedOfficer(officer)
      setSafetyCheck(safety)
      setStep("confirm")
      console.log("Selected officer for deletion:", officer)
      console.log("Safety check results:", safety)
    } catch (error) {
      console.error("Error loading officer details:", error)
      setSubmitMessage(`❌ Error loading officer details: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedOfficer || !safetyCheck?.canDelete) {
      return
    }

    setIsDeleting(true)
    setSubmitMessage("")
    setStep("deleting")

    try {
      const officerId = selectedOfficer.documentId || selectedOfficer.id
      console.log("Deleting officer with ID:", officerId)

      const result = await deleteOfficer(officerId)
      console.log("Officer deleted successfully:", result)

      setSubmitMessage(
        `✅ Officer "${selectedOfficer.Name}" has been successfully deleted!`
      )

      // Call success callback
      if (onSuccess) {
        setTimeout(() => {
          onSuccess(result)
        }, 1500)
      }
    } catch (error) {
      console.error("Error deleting officer:", error)

      if (error.blockers) {
        setSubmitMessage(`❌ Cannot delete: ${error.blockers.join(", ")}`)
      } else if (error.response?.data?.error?.message) {
        setSubmitMessage(`❌ Error: ${error.response.data.error.message}`)
      } else {
        setSubmitMessage(`❌ Failed to delete officer: ${error.message}`)
      }
      setStep("confirm") // Go back to confirm step if deletion fails
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancel = () => {
    if (onClose) {
      onClose()
    }
  }

  const handleBack = () => {
    setStep("select")
    setSelectedOfficer(null)
    setSafetyCheck(null)
    setSubmitMessage("")
  }

  // Selection step
  if (step === "select") {
    return (
      <div className="space-y-4 bg-gray-100 p-6 rounded-lg shadow-lg border border-gray-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-800">
            Select Officer to Delete
          </h3>
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
                className="border border-gray-300 hover:bg-red-50 rounded-lg p-4 cursor-pointer transition-colors bg-gray-200"
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
            className="px-6 py-2 border border-gray-300 rounded text-white bg-red-600 hover:bg-red-700 transition duration-300"
            onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // Deleting step
  if (step === "deleting") {
    return (
      <div className="space-y-4 bg-gray-100 p-6 rounded-lg shadow-lg border border-gray-300">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Deleting officer...</p>
          <p className="text-sm text-gray-500">This may take a moment</p>
        </div>

        {submitMessage && (
          <div
            className={`text-center p-3 rounded ${
              submitMessage.includes("✅")
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-red-100 text-red-700 border border-red-300"
            }`}>
            <div className="font-medium">{submitMessage}</div>
          </div>
        )}
      </div>
    )
  }

  // Confirmation step
  return (
    <div className="space-y-4 bg-gray-100 p-6 rounded-lg shadow-lg border border-gray-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-800">
          Confirm Officer Deletion
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

      {/* Officer details */}
      <div className="bg-white border border-gray-300 rounded-lg p-4 mb-4">
        <h4 className="font-medium text-gray-800 mb-2">Officer Details:</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>
            <strong>Name:</strong> {selectedOfficer?.Name}
          </p>
          <p>
            <strong>Position(s):</strong> {selectedOfficer?.Positions}
          </p>
          <p>
            <strong>Golf Club:</strong>{" "}
            {selectedOfficer?.golf_club?.clubName || "Unknown"}
          </p>
        </div>
      </div>

      {/* Safety warnings */}
      {safetyCheck && (
        <div className="space-y-3">
          {/* Blockers - prevent deletion */}
          {safetyCheck.blockers?.length > 0 && (
            <div className="bg-red-50 border border-red-300 rounded p-4">
              <h4 className="font-medium text-red-800 mb-2">
                🚫 Cannot Delete - Critical Issues:
              </h4>
              <ul className="text-sm text-red-700 space-y-1">
                {safetyCheck.blockers.map((blocker, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>{blocker}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings - allow deletion but warn user */}
          {safetyCheck.warnings?.length > 0 && safetyCheck.canDelete && (
            <div className="bg-yellow-50 border border-yellow-300 rounded p-4">
              <h4 className="font-medium text-yellow-800 mb-2">
                ⚠️ Warning - Please Review:
              </h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                {safetyCheck.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-yellow-600 mt-2">
                Deleting this officer will permanently remove them from the
                system.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Deletion confirmation */}
      {safetyCheck?.canDelete && (
        <div className="bg-red-50 border border-red-300 rounded p-4">
          <h4 className="font-medium text-red-800 mb-2">
            ⚠️ Permanent Deletion Warning
          </h4>
          <p className="text-sm text-red-700">
            This action cannot be undone. Officer &quot;{selectedOfficer?.Name}
            &quot; will be permanently removed from the system.
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={handleBack}
          className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition duration-300"
          disabled={isDeleting}>
          Back
        </button>

        {safetyCheck?.canDelete ? (
          <button
            onClick={handleConfirmDelete}
            className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isDeleting}>
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Deleting...</span>
              </div>
            ) : (
              "Confirm Delete"
            )}
          </button>
        ) : (
          <button
            className="px-6 py-2 bg-gray-400 text-white rounded cursor-not-allowed"
            disabled>
            Cannot Delete
          </button>
        )}
      </div>
    </div>
  )
}

export default DeleteOfficer
