import { useState, useEffect } from "react"
import AddGolfer from "./addGolfer"
import EditGolfer from "./editGolfer"
import DeleteGolfer from "./deleteGolfer"
import { getAllGolfers } from "../../../utils/api/golfersApi"

const ManageGolfers = () => {
  const [activeAction, setActiveAction] = useState(null)
  const [notification, setNotification] = useState(null)
  const [golfersCount, setGolfersCount] = useState(0)
  const [proCount, setProCount] = useState(0)
  const [seniorCount, setSeniorCount] = useState(0)
  const [isLoadingStats, setIsLoadingStats] = useState(false)

  // Load initial statistics
  useEffect(() => {
    loadGolferStatistics()
  }, [])

  const loadGolferStatistics = async () => {
    setIsLoadingStats(true)
    try {
      const golfers = await getAllGolfers()
      setGolfersCount(golfers.length)

      // Count professionals and seniors
      const pros = golfers.filter((golfer) => golfer.isPro === true)
      const seniors = golfers.filter((golfer) => golfer.isSenior === true)

      setProCount(pros.length)
      setSeniorCount(seniors.length)
    } catch (error) {
      console.error("Error loading golfer statistics:", error)
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

  const handleAddGolferSuccess = async (result) => {
    console.log("Golfer added successfully:", result)

    // Show success notification
    const golferName = result?.data?.golferName || "New golfer"
    showNotification(
      `✅ ${golferName} has been successfully added to the system!`,
      "success"
    )

    // Refresh golfer statistics
    await loadGolferStatistics()

    // Close the active action after a brief delay to show success
    setTimeout(() => {
      setActiveAction(null)
    }, 2000)
  }

  const handleEditGolferSuccess = async (result) => {
    console.log("Golfer updated successfully:", result)

    // Show success notification
    const golferName = result?.data?.golferName || "Golfer"
    showNotification(
      `✅ ${golferName} information has been successfully updated!`,
      "success"
    )

    // Refresh golfer statistics (in case status changed)
    await loadGolferStatistics()

    // Close the active action after a brief delay
    setTimeout(() => {
      setActiveAction(null)
    }, 2000)
  }

  const handleDeleteGolferSuccess = async (result) => {
    console.log("Golfer deleted successfully:", result)

    // Show success notification
    showNotification(
      `✅ Golfer has been successfully removed from the system.`,
      "success"
    )

    // Refresh golfer statistics
    await loadGolferStatistics()

    // Close the active action after a brief delay
    setTimeout(() => {
      setActiveAction(null)
    }, 2000)
  }

  const handleCloseAction = () => {
    setActiveAction(null)
  }

  return (
    <div className="w-full">
      {/* Notification */}
      {notification && (
        <div
          className={`mb-4 p-3 rounded border ${
            notification.type === "success"
              ? "bg-green-50 border-green-400 text-green-700"
              : notification.type === "error"
              ? "bg-red-50 border-red-400 text-red-700"
              : "bg-blue-50 border-blue-400 text-blue-700"
          }`}>
          <div className="flex items-start justify-between">
            <div className="font-bold text-sm md:text-base pr-2">
              {notification.message}
            </div>
            <button
              onClick={hideNotification}
              className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
              <svg
                className="w-4 h-4 md:w-5 md:h-5"
                fill="currentColor"
                viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      {activeAction ? (
        <div>
          {/* Render different components based on active action */}
          {activeAction === "add" && (
            <AddGolfer
              onClose={handleCloseAction}
              onSuccess={handleAddGolferSuccess}
            />
          )}

          {activeAction === "edit" && (
            <EditGolfer
              onClose={handleCloseAction}
              onSuccess={handleEditGolferSuccess}
            />
          )}

          {activeAction === "delete" && (
            <DeleteGolfer
              onClose={handleCloseAction}
              onSuccess={handleDeleteGolferSuccess}
            />
          )}
        </div>
      ) : (
        <div className="text-center">
          <p className="mb-3 text-gray-700">
            Add new golfers to the system, edit existing golfer information, or
            remove golfers who are no longer active.
          </p>

          {/* Golfer Statistics Pills */}
          <div className="mb-6 flex justify-center gap-4">
            <div className="text-sm text-gray-600">
              {isLoadingStats ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                <div className="flex gap-4 flex-wrap justify-center">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                    {golfersCount} Total{" "}
                    {golfersCount === 1 ? "Golfer" : "Golfers"}
                  </span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                    {proCount} {proCount === 1 ? "Pro" : "Pros"}
                  </span>
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium">
                    {seniorCount} {seniorCount === 1 ? "Senior" : "Seniors"}
                  </span>
                </div>
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
              Add New Golfer
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
              Edit Golfer
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
              Delete Golfer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageGolfers
