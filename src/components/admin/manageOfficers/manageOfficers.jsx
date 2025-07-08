import { useState, useEffect } from "react"
import AddOfficer from "./addOfficers"
import EditOfficer from "./editOfficers"
import DeleteOfficer from "./deleteOfficers"
import { getAllOfficers } from "../../../utils/api/officersApi"

const ManageOfficers = () => {
  const [activeAction, setActiveAction] = useState(null)
  const [notification, setNotification] = useState(null)
  const [officersCount, setOfficersCount] = useState(0)
  const [isLoadingStats, setIsLoadingStats] = useState(false)

  // Load initial statistics
  useEffect(() => {
    loadOfficerStatistics()
  }, [])

  const loadOfficerStatistics = async () => {
    setIsLoadingStats(true)
    try {
      const officers = await getAllOfficers()
      setOfficersCount(officers.length)
    } catch (error) {
      console.error("Error loading officer statistics:", error)
    } finally {
      setIsLoadingStats(false)
    }
  }

  const showNotification = (message, type = "success") => {
    setNotification({ message, type })
    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setNotification(null)
    }, 5000)
  }

  const hideNotification = () => {
    setNotification(null)
  }

  const handleAddOfficerSuccess = async (result) => {
    console.log("Officer added successfully:", result)

    // Show success notification
    const officerName = result?.data?.Name || "New officer"
    showNotification(
      `✅ ${officerName} has been successfully added as an officer!`,
      "success"
    )

    // Refresh officer statistics
    await loadOfficerStatistics()

    // Optional: Trigger any parent component updates
    // if (onOfficersUpdated) onOfficersUpdated()

    // Close the active action after a brief delay to show success
    setTimeout(() => {
      setActiveAction(null)
    }, 2000)
  }

  const handleEditOfficerSuccess = async (result) => {
    console.log("Officer updated successfully:", result)

    // Show success notification
    const officerName = result?.data?.Name || "Officer"
    showNotification(
      `✅ ${officerName} information has been successfully updated!`,
      "success"
    )

    // Refresh officer statistics (in case officer name changed)
    await loadOfficerStatistics()

    // Optional: Clear any cached officer data
    // if (clearOfficerCache) clearOfficerCache()

    // Close the active action after a brief delay
    setTimeout(() => {
      setActiveAction(null)
    }, 2000)
  }

  const handleDeleteOfficerSuccess = async (result) => {
    console.log("Officer deleted successfully:", result)

    // Show success notification
    showNotification(
      `✅ Officer has been successfully removed from the system.`,
      "success"
    )

    // Refresh officer statistics
    await loadOfficerStatistics()

    // Close the active action after a brief delay
    setTimeout(() => {
      setActiveAction(null)
    }, 2000)
  }

  const handleCloseAction = () => {
    setActiveAction(null)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-6 text-[#214A27]">
        Manage Club Officers
      </h2>

      {/* Show notification */}
      {notification && (
        <div
          className={`mb-4 p-4 border rounded ${
            notification.type === "success"
              ? "bg-green-100 text-green-700 border-green-300"
              : notification.type === "error"
              ? "bg-red-100 text-red-700 border-red-300"
              : "bg-blue-100 text-blue-700 border-blue-300"
          }`}>
          <div className="flex items-start justify-between">
            <div className="font-medium">{notification.message}</div>
            <button
              onClick={hideNotification}
              className="text-gray-400 hover:text-gray-600 transition-colors ml-4">
              <svg
                className="w-5 h-5"
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
        </div>
      )}

      {activeAction ? (
        <div>
          {/* Render different components based on active action */}
          {activeAction === "add" && (
            <AddOfficer
              onClose={handleCloseAction}
              onSuccess={handleAddOfficerSuccess}
            />
          )}

          {activeAction === "edit" && (
            <EditOfficer
              onClose={handleCloseAction}
              onSuccess={handleEditOfficerSuccess}
            />
          )}

          {activeAction === "delete" && (
            <DeleteOfficer
              onClose={handleCloseAction}
              onSuccess={handleDeleteOfficerSuccess}
            />
          )}
        </div>
      ) : (
        <div className="text-center">
          <p className="mb-3 text-gray-700">
            Add new club officers, edit existing officer information, or remove
            officers who are no longer active.
          </p>

          {/* Officers Count Pill */}
          <div className="mb-6 flex justify-center">
            <div className="text-sm text-gray-600">
              {isLoadingStats ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                  {officersCount} {officersCount === 1 ? "Officer" : "Officers"}{" "}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 justify-center items-center">
            <button
              className="bg-[#214A27] hover:bg-green-600 text-white px-6 py-3 rounded transition duration-300 font-medium flex items-center justify-center gap-2 min-w-[200px]"
              onClick={() => setActiveAction("add")}>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add New Officer
            </button>

            <button
              className="bg-[#214A27] hover:bg-green-600 text-white px-6 py-3 rounded transition duration-300 font-medium flex items-center justify-center gap-2 min-w-[200px]"
              onClick={() => setActiveAction("edit")}>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit Officer
            </button>

            <button
              className="bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700 transition duration-300 font-medium flex items-center justify-center gap-2 min-w-[200px]"
              onClick={() => setActiveAction("delete")}>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete Officer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageOfficers
