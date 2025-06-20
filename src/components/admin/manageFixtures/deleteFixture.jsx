import { useState, useEffect } from "react"
import {
  getAllFixtures,
  getFixtureById,
  deleteFixture,
  checkFixtureDeletionSafety,
} from "../../../utils/api/fixturesApi"

const DeleteFixture = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState("select") // "select", "confirm", or "deleting"
  const [fixtures, setFixtures] = useState([])
  const [selectedFixture, setSelectedFixture] = useState(null)
  const [safetyCheck, setSafetyCheck] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")
  const [confirmText, setConfirmText] = useState("")

  // Load all fixtures on component mount
  useEffect(() => {
    const loadFixtures = async () => {
      setIsLoading(true)
      try {
        const fixturesData = await getAllFixtures()
        // Sort fixtures by date (most recent first) then by event type
        const sortedFixtures = fixturesData.sort((a, b) => {
          const dateA = new Date(a.eventDate)
          const dateB = new Date(b.eventDate)
          if (dateA.getTime() !== dateB.getTime()) {
            return dateB - dateA // Most recent first
          }
          return (a.eventType || "").localeCompare(b.eventType || "")
        })
        setFixtures(sortedFixtures)
      } catch (error) {
        console.error("Error loading fixtures:", error)
        setSubmitMessage("❌ Error loading fixtures")
      } finally {
        setIsLoading(false)
      }
    }
    loadFixtures()
  }, [])

  const handleFixtureSelect = async (fixtureId) => {
    if (!fixtureId) return

    setIsLoading(true)
    try {
      // Load fixture details and safety check in parallel
      const [fixtureData, safetyData] = await Promise.all([
        getFixtureById(fixtureId),
        checkFixtureDeletionSafety(fixtureId),
      ])

      setSelectedFixture(fixtureData)
      setSafetyCheck(safetyData)
      setStep("confirm")
    } catch (error) {
      console.error("Error loading fixture details:", error)
      setSubmitMessage("❌ Error loading fixture details")
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
        "❌ This fixture cannot be deleted due to safety restrictions"
      )
      return
    }

    // Final confirmation alert
    const finalConfirmation = window.confirm(
      `⚠️ FINAL CONFIRMATION ⚠️\n\nAre you absolutely sure you want to permanently delete the "${
        selectedFixture?.eventType
      }" fixture scheduled for ${formatDate(
        selectedFixture?.eventDate
      )}?\n\nThis action cannot be undone and will remove the fixture from the calendar permanently.\n\nClick OK to proceed with deletion, or Cancel to abort.`
    )

    if (!finalConfirmation) {
      setSubmitMessage("❌ Deletion cancelled by user")
      return
    }

    setIsDeleting(true)
    setSubmitMessage("")

    try {
      const result = await deleteFixture(
        selectedFixture.id || selectedFixture.documentId
      )

      console.log("Fixture deleted successfully:", result)
      setSubmitMessage("✅ Fixture deleted successfully!")

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
      console.error("Error deleting fixture:", error)

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

      setSubmitMessage(`❌ Error deleting fixture: ${errorMessage}`)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleBack = () => {
    setStep("select")
    setSelectedFixture(null)
    setSafetyCheck(null)
    setConfirmText("")
    setSubmitMessage("")
  }

  const handleCancel = () => {
    handleBack()
    if (onClose) onClose()
  }

  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatDateShort = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (step === "select") {
    return (
      <div className="space-y-4 bg-gray-100 p-6 rounded-lg shadow-lg border border-gray-300">
        <h3 className="text-lg font-medium text-center text-gray-800">
          Select Fixture to Delete
        </h3>
        <p className="text-sm text-gray-600 text-center mb-4">
          ⚠️ Choose which fixture you want to delete. This action cannot be
          undone.
        </p>

        {submitMessage && (
          <div className="text-center p-3 rounded mb-4 bg-red-100 text-red-700 border border-red-300">
            <div className="font-medium">{submitMessage}</div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading fixtures...</p>
          </div>
        ) : fixtures.length > 0 ? (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {fixtures.map((fixture) => (
              <div
                key={fixture.id || fixture.documentId}
                className="border border-gray-300 rounded-lg p-4 hover:bg-red-50 cursor-pointer transition-colors duration-200 hover:border-red-300"
                onClick={() =>
                  handleFixtureSelect(fixture.id || fixture.documentId)
                }>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-800 text-lg">
                      {fixture.golf_club?.clubName || "No club assigned"}
                    </h4>
                    <span className="text-sm font-medium text-gray-600 bg-gray-200 px-2 py-1 rounded">
                      {formatDateShort(fixture.eventDate)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-gray-600">{fixture.eventType}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600">No fixtures found</p>
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
          Delete Fixture: {selectedFixture?.eventType}
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

      {/* Fixture details */}
      <div className="bg-white border border-gray-300 rounded-lg p-4 mb-4">
        <h4 className="font-medium text-gray-800 mb-3">Fixture Details:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <p className="mb-2">
              <strong className="text-gray-800">Event Type:</strong>
              <br />
              {selectedFixture?.eventType}
            </p>
            <p className="mb-2">
              <strong className="text-gray-800">Date:</strong>
              <br />
              {formatDate(selectedFixture?.eventDate)}
            </p>
          </div>
          <div>
            <p className="mb-2">
              <strong className="text-gray-800">Host Club:</strong>
              <br />
              {selectedFixture?.golf_club?.clubName || "No club assigned"}
            </p>
            {selectedFixture?.golf_club?.clubAddress && (
              <p className="mb-2">
                <strong className="text-gray-800">Club Address:</strong>
                <br />
                {selectedFixture.golf_club.clubAddress}
              </p>
            )}
          </div>
        </div>
        {selectedFixture?.eventReview && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p>
              <strong className="text-gray-800">Event Review:</strong>
              <br />
              <span className="text-sm text-gray-600">
                {selectedFixture.eventReview}
              </span>
            </p>
          </div>
        )}
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
              <p className="text-xs text-red-600 mt-2">
                You must remove associated scores and tee times before deleting
                this fixture.
              </p>
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
                Deleting this fixture will not remove associated data, but may
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
                This fixture has no associated scores or tee times and can be
                safely deleted.
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
            💡 After clicking &quot;Delete Fixture&quot;, you&#39;ll see one
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
              "Delete Fixture"
            )}
          </button>
        )}
      </div>
    </div>
  )
}

export default DeleteFixture
