import { useState, useEffect } from "react"
import AddFixture from "./addFixture"
import EditFixture from "./editFixture"
import DeleteFixture from "./deleteFixture"
import { getAllFixtures } from "../../../utils/api/fixturesApi"

const ManageFixtures = () => {
  const [activeAction, setActiveAction] = useState(null)
  const [notification, setNotification] = useState(null)
  const [fixturesCount, setFixturesCount] = useState(0)
  const [upcomingFixtures, setUpcomingFixtures] = useState(0)
  const [isLoadingStats, setIsLoadingStats] = useState(false)

  // Load initial statistics
  useEffect(() => {
    loadFixtureStatistics()
  }, [])

  const loadFixtureStatistics = async () => {
    setIsLoadingStats(true)
    try {
      const fixtures = await getAllFixtures()
      setFixturesCount(fixtures.length)

      // Count upcoming fixtures (future dates)
      const today = new Date()
      const upcoming = fixtures.filter((fixture) => {
        const fixtureDate = new Date(fixture.eventDate)
        return fixtureDate >= today
      })
      setUpcomingFixtures(upcoming.length)
    } catch (error) {
      console.error("Error loading fixture statistics:", error)
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

  const handleAddFixtureSuccess = async (result) => {
    console.log("Fixture added successfully:", result)

    // Show success notification
    const eventType = result?.data?.eventType || "New fixture"
    const eventDate = result?.data?.eventDate || ""
    const dateText = eventDate
      ? ` for ${new Date(eventDate).toLocaleDateString("en-GB")}`
      : ""
    showNotification(
      `✅ ${eventType} fixture${dateText} has been successfully added to the calendar!`,
      "success"
    )

    // Refresh fixture statistics
    await loadFixtureStatistics()

    // Close the active action after a brief delay to show success
    setTimeout(() => {
      setActiveAction(null)
    }, 2000)
  }

  const handleEditFixtureSuccess = async (result) => {
    console.log("Fixture updated successfully:", result)

    // Show success notification
    const eventType = result?.data?.eventType || "Fixture"
    const eventDate = result?.data?.eventDate || ""
    const dateText = eventDate
      ? ` (${new Date(eventDate).toLocaleDateString("en-GB")})`
      : ""
    showNotification(
      `✅ ${eventType} fixture${dateText} has been successfully updated!`,
      "success"
    )

    // Refresh fixture statistics
    await loadFixtureStatistics()

    // Close the active action after a brief delay
    setTimeout(() => {
      setActiveAction(null)
    }, 2000)
  }

  const handleDeleteFixtureSuccess = async (result) => {
    console.log("Fixture deleted successfully:", result)

    // Show success notification with warnings if any
    let message = `✅ Fixture has been successfully removed from the calendar.`
    if (result.warnings && result.warnings.length > 0) {
      message += ` Note: ${result.warnings.join(", ")}`
    }
    showNotification(message, "success")

    // Refresh fixture statistics
    await loadFixtureStatistics()

    // Close the active action after a brief delay
    setTimeout(() => {
      setActiveAction(null)
    }, 2000)
  }

  const handleCloseAction = () => {
    setActiveAction(null)
    // Clear any notifications when closing
    setNotification(null)
  }

  return (
    <div className="h-full flex flex-col space-y-4 bg-gray-100 p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-center">
        <h2 className="text-lg font-semibold">Manage Fixtures</h2>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-lg border-l-4 ${
            notification.type === "success"
              ? "bg-green-50 border-green-400 text-green-700"
              : notification.type === "error"
              ? "bg-red-50 border-red-400 text-red-700"
              : "bg-blue-50 border-blue-400 text-blue-700"
          }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="font-medium">{notification.message}</div>
            </div>
            <button
              onClick={hideNotification}
              className="text-gray-400 hover:text-gray-600 transition-colors">
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

      {!activeAction ? (
        <div className="text-center">
          <p className="mb-3 text-gray-700">
            Add new fixtures to the competition calendar, edit existing fixture
            details, or remove fixtures that have been cancelled.
          </p>

          {/* Fixture Statistics Pills */}
          <div className="mb-6 flex justify-center gap-4">
            <div className="text-sm text-gray-600">
              {isLoadingStats ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                <div className="flex gap-4">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                    {fixturesCount} Total{" "}
                    {fixturesCount === 1 ? "Fixture" : "Fixtures"}
                  </span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                    {upcomingFixtures} Upcoming
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
              Add New Fixture
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
              Edit Fixture
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
              Delete Fixture
            </button>
          </div>
        </div>
      ) : (
        <div>
          {/* Render different components based on active action */}
          {activeAction === "add" && (
            <AddFixture
              onClose={handleCloseAction}
              onSuccess={handleAddFixtureSuccess}
            />
          )}

          {activeAction === "edit" && (
            <EditFixture
              onClose={handleCloseAction}
              onSuccess={handleEditFixtureSuccess}
            />
          )}

          {activeAction === "delete" && (
            <DeleteFixture
              onClose={handleCloseAction}
              onSuccess={handleDeleteFixtureSuccess}
            />
          )}
        </div>
      )}
    </div>
  )
}

export default ManageFixtures
