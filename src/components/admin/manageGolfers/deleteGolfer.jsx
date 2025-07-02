import { useState, useEffect } from "react"
import {
  getAllGolfers,
  getGolferById,
  deleteGolfer,
  checkGolferDeletionSafety,
} from "../../../utils/api/golfersApi"

const DeleteGolfer = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState("select") // "select", "confirm", or "deleting"
  const [golfers, setGolfers] = useState([])
  const [selectedGolfer, setSelectedGolfer] = useState(null)
  const [safetyCheck, setSafetyCheck] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")
  const [confirmText, setConfirmText] = useState("")

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

  const handleGolferSelect = async (golferId) => {
    if (!golferId) return

    setIsLoading(true)
    try {
      // Load golfer details and safety check in parallel
      const [golferData, safetyData] = await Promise.all([
        getGolferById(golferId),
        checkGolferDeletionSafety(golferId),
      ])

      setSelectedGolfer(golferData)
      setSafetyCheck(safetyData)
      setStep("confirm")
    } catch (error) {
      console.error("Error loading golfer details:", error)
      setSubmitMessage("❌ Error loading golfer details")
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
        "❌ This golfer cannot be deleted due to safety restrictions"
      )
      return
    }

    // Final confirmation alert
    const finalConfirmation = window.confirm(
      `⚠️ FINAL CONFIRMATION ⚠️\n\nAre you absolutely sure you want to permanently delete the golfer "${selectedGolfer?.golferName}"?\n\nThis action cannot be undone and will remove the golfer from all records.\n\nClick OK to proceed with deletion, or Cancel to abort.`
    )

    if (!finalConfirmation) {
      setSubmitMessage("❌ Deletion cancelled by user")
      return
    }

    setIsDeleting(true)
    setSubmitMessage("")

    try {
      const result = await deleteGolfer(
        selectedGolfer.id || selectedGolfer.documentId
      )

      console.log("Golfer deleted successfully:", result)
      setSubmitMessage("✅ Golfer deleted successfully!")

      // Call parent success handler
      if (onSuccess) {
        onSuccess(result)
      }
    } catch (error) {
      console.error("Error deleting golfer:", error)

      if (error.blockers || error.warnings) {
        const blockerText = error.blockers?.join("; ") || ""
        const warningText = error.warnings?.join("; ") || ""
        setSubmitMessage(
          `❌ Cannot delete golfer: ${blockerText} ${warningText}`.trim()
        )
      } else {
        setSubmitMessage("❌ Failed to delete golfer. Please try again.")
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const handleBack = () => {
    setStep("select")
    setSelectedGolfer(null)
    setSafetyCheck(null)
    setSubmitMessage("")
    setConfirmText("")
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
            Select Golfer to Delete
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
                className="border border-gray-300 hover:bg-red-50 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors bg-gray-200"
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

  // Confirmation step
  return (
    <div className="space-y-4 bg-gray-100 p-6 rounded-lg shadow-lg border border-gray-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-800">
          Delete Golfer: {selectedGolfer?.golferName}
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

      {/* Golfer details */}
      <div className="bg-white border border-gray-300 rounded-lg p-4 mb-4">
        <h4 className="font-medium text-gray-800 mb-2">Golfer Details:</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>
            <strong>Name:</strong> {selectedGolfer?.golferName}
          </p>
          <p>
            <strong>Club:</strong>{" "}
            {selectedGolfer?.golf_club?.clubName || "No club assigned"}
          </p>
          <p>
            <strong>Status:</strong>
            {selectedGolfer?.isPro && " Professional"}
            {selectedGolfer?.isSenior && " Senior"}
            {!selectedGolfer?.isPro && !selectedGolfer?.isSenior && " Amateur"}
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
                Deleting this golfer may affect related records.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Deletion form - only show if deletion is allowed */}
      {safetyCheck?.canDelete && (
        <div className="bg-red-50 border border-red-300 rounded p-4">
          <h4 className="font-medium text-red-800 mb-3">⚠️ Confirm Deletion</h4>
          <p className="text-sm text-red-700 mb-3">
            This action cannot be undone. Type <strong>DELETE</strong> to
            confirm:
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type DELETE to confirm"
            className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent mb-3"
          />
          <button
            onClick={handleDelete}
            disabled={isDeleting || confirmText.toLowerCase() !== "delete"}
            className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
            {isDeleting ? "Deleting..." : "DELETE GOLFER PERMANENTLY"}
          </button>
        </div>
      )}

      {/* Cancel button */}
      <div className="flex justify-center pt-4">
        <button
          type="button"
          onClick={handleBack}
          className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition duration-300">
          Cancel
        </button>
      </div>
    </div>
  )
}

export default DeleteGolfer
