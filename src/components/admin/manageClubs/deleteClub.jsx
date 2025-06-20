import { useState, useEffect } from "react"
import {
  getAllGolfClubs,
  getGolfClubById,
  deleteGolfClub,
  checkClubDeletionSafety,
} from "../../../utils/api/clubsApi"

const DeleteClub = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState("select") // "select", "confirm", or "deleting"
  const [clubs, setClubs] = useState([])
  const [selectedClub, setSelectedClub] = useState(null)
  const [safetyCheck, setSafetyCheck] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")
  const [confirmText, setConfirmText] = useState("")

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

  const handleClubSelect = async (clubId) => {
    if (!clubId) return

    setIsLoading(true)
    try {
      // Load club details and safety check in parallel
      const [clubData, safetyData] = await Promise.all([
        getGolfClubById(clubId),
        checkClubDeletionSafety(clubId),
      ])

      setSelectedClub(clubData)
      setSafetyCheck(safetyData)
      setStep("confirm")
    } catch (error) {
      console.error("Error loading club details:", error)
      setSubmitMessage("❌ Error loading club details")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (confirmText.toLowerCase() !== "delete") {
      setSubmitMessage("❌ Please type 'DELETE' to confirm deletion")
      return
    }

    if (!safetyCheck?.canDelete) {
      setSubmitMessage(
        "❌ This club cannot be deleted due to safety restrictions"
      )
      return
    }

    // Final confirmation alert
    const finalConfirmation = window.confirm(
      `⚠️ FINAL CONFIRMATION ⚠️\n\nAre you absolutely sure you want to permanently delete "${selectedClub?.clubName}"?\n\nThis action cannot be undone and will remove the club from the alliance permanently.\n\nClick OK to proceed with deletion, or Cancel to abort.`
    )

    if (!finalConfirmation) {
      setSubmitMessage("❌ Deletion cancelled by user")
      return
    }

    setIsDeleting(true)
    setSubmitMessage("")

    try {
      const result = await deleteGolfClub(
        selectedClub.id || selectedClub.documentId
      )

      console.log("Golf club deleted successfully:", result)
      setSubmitMessage("✅ Golf club deleted successfully!")

      // Show warnings if any
      if (result.warnings?.length > 0) {
        console.warn("Deletion warnings:", result.warnings)
      }

      // Close form after a brief delay to show success message
      setTimeout(() => {
        setSubmitMessage("")
        if (onClose) onClose()
        if (onSuccess) onSuccess(result)
      }, 2000)
    } catch (error) {
      console.error("Error deleting golf club:", error)

      let errorMessage = "Unknown error"
      if (error.blockers && error.blockers.length > 0) {
        errorMessage = `Cannot delete: ${error.blockers.join(", ")}`
      } else if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }

      setSubmitMessage(`❌ Error deleting golf club: ${errorMessage}`)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleBack = () => {
    setStep("select")
    setSelectedClub(null)
    setSafetyCheck(null)
    setConfirmText("")
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
          Select Golf Club to Delete
        </h3>
        <p className="text-sm text-gray-600 text-center mb-4">
          ⚠️ Choose which club you want to delete. This action cannot be undone.
        </p>

        {submitMessage && (
          <div className="text-center p-3 rounded mb-4 bg-red-100 text-red-700 border border-red-300">
            <div className="font-medium">{submitMessage}</div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading clubs...</p>
          </div>
        ) : clubs.length > 0 ? (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {clubs.map((club) => (
              <div
                key={club.id || club.documentId}
                className="border border-gray-300 rounded-lg p-4 hover:bg-red-50 cursor-pointer transition-colors"
                onClick={() => handleClubSelect(club.id || club.documentId)}>
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
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition duration-300"
            onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // Confirmation step
  return (
    <div className="space-y-4 bg-gray-100 p-6 rounded-lg shadow-lg border border-gray-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-800">
          Delete Golf Club: {selectedClub?.clubName}
        </h3>
        <button
          type="button"
          onClick={handleBack}
          className="text-sm text-blue-600 hover:text-blue-800"
          disabled={isDeleting}>
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

      {/* Club details */}
      <div className="bg-white border border-gray-300 rounded-lg p-4 mb-4">
        <h4 className="font-medium text-gray-800 mb-2">Club Details:</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>
            <strong>Name:</strong> {selectedClub?.clubName}
          </p>
          <p>
            <strong>Address:</strong> {selectedClub?.clubAddress}
          </p>
          <p>
            <strong>Club ID:</strong> {selectedClub?.clubID}
          </p>
          {selectedClub?.clubURL && (
            <p>
              <strong>Website:</strong> {selectedClub.clubURL}
            </p>
          )}
          {selectedClub?.clubContactNumber && (
            <p>
              <strong>Contact:</strong> {selectedClub.clubContactNumber}
            </p>
          )}
          {selectedClub?.proName && (
            <p>
              <strong>Professional:</strong> {selectedClub.proName}
            </p>
          )}
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
                ⚠️ Warning - Associated Data:
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
                Deleting this club will not remove associated data, but may
                cause references to become invalid.
              </p>
            </div>
          )}

          {/* Safe to delete */}
          {safetyCheck.canDelete && safetyCheck.warnings?.length === 0 && (
            <div className="bg-green-50 border border-green-300 rounded p-4">
              <h4 className="font-medium text-green-800 mb-2">
                ✅ Safe to Delete
              </h4>
              <p className="text-sm text-green-700">
                This club has no associated data and can be safely deleted.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Confirmation input - only show if deletion is allowed */}
      {safetyCheck?.canDelete && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-800 mb-2">Confirm Deletion</h4>
          <p className="text-sm text-red-700 mb-3">
            This action cannot be undone. Type <strong>DELETE</strong> to
            confirm:
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full p-3 border border-red-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Type DELETE to confirm"
            disabled={isDeleting}
          />
          <p className="text-xs text-red-600 mt-2">
            💡 After clicking &quot;Delete Golf Club&quot;, you&#39;ll see one
            final confirmation dialog before the deletion is processed.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition duration-300"
          onClick={handleCancel}
          disabled={isDeleting}>
          Cancel
        </button>

        {safetyCheck?.canDelete && (
          <button
            onClick={handleDelete}
            className={`px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
              isDeleting || confirmText.toLowerCase() !== "delete"
                ? "opacity-50"
                : ""
            }`}
            disabled={isDeleting || confirmText.toLowerCase() !== "delete"}>
            {isDeleting ? (
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
                Deleting...
              </span>
            ) : (
              "Delete Golf Club"
            )}
          </button>
        )}
      </div>
    </div>
  )
}

export default DeleteClub
