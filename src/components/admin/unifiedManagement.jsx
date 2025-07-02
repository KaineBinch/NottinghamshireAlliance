import { useState, useEffect } from "react"
import { Calendar, Users, Plus, Edit, Trash2, X } from "lucide-react"

// Import your existing sub-components
import AddFixture from "./manageFixtures/addFixture"
import EditFixture from "./manageFixtures/editFixture"
import DeleteFixture from "./manageFixtures/deleteFixture"
import AddClub from "./manageClubs/addClub"
import EditClub from "./manageClubs/editClub"
import DeleteClub from "./manageClubs/deleteClub"

// Import your API functions
import { getAllFixtures } from "../../utils/api/fixturesApi"
import { getAllGolfClubs } from "../../utils/api/clubsApi"

const UnifiedManagement = () => {
  const [activeView, setActiveView] = useState("fixtures")
  const [activeAction, setActiveAction] = useState(null)
  const [notification, setNotification] = useState(null)

  // Fixtures stats
  const [fixturesCount, setFixturesCount] = useState(0)
  const [upcomingFixtures, setUpcomingFixtures] = useState(0)

  // Clubs stats
  const [clubsCount, setClubsCount] = useState(0)

  const [isLoadingStats, setIsLoadingStats] = useState(false)

  // Load initial statistics
  useEffect(() => {
    loadAllStatistics()
  }, [])

  const loadAllStatistics = async () => {
    setIsLoadingStats(true)
    try {
      await Promise.all([loadFixtureStatistics(), loadClubStatistics()])
    } catch (error) {
      console.error("Error loading statistics:", error)
    } finally {
      setIsLoadingStats(false)
    }
  }

  const loadFixtureStatistics = async () => {
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
    }
  }

  const loadClubStatistics = async () => {
    try {
      const clubs = await getAllGolfClubs()
      setClubsCount(clubs.length)
    } catch (error) {
      console.error("Error loading club statistics:", error)
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

  // Fixture success handlers
  const handleAddFixtureSuccess = async (result) => {
    console.log("Fixture added successfully:", result)
    const eventType = result?.data?.eventType || "New fixture"
    const eventDate = result?.data?.eventDate || ""
    const dateText = eventDate
      ? ` for ${new Date(eventDate).toLocaleDateString("en-GB")}`
      : ""
    showNotification(
      `✅ ${eventType} fixture${dateText} has been successfully added to the calendar!`,
      "success"
    )
    await loadFixtureStatistics()
    setTimeout(() => setActiveAction(null), 2000)
  }

  const handleEditFixtureSuccess = async (result) => {
    console.log("Fixture updated successfully:", result)
    const eventType = result?.data?.eventType || "Fixture"
    const eventDate = result?.data?.eventDate || ""
    const dateText = eventDate
      ? ` (${new Date(eventDate).toLocaleDateString("en-GB")})`
      : ""
    showNotification(
      `✅ ${eventType} fixture${dateText} has been successfully updated!`,
      "success"
    )
    await loadFixtureStatistics()
    setTimeout(() => setActiveAction(null), 2000)
  }

  const handleDeleteFixtureSuccess = async (result) => {
    console.log("Fixture deleted successfully:", result)
    let message = `✅ Fixture has been successfully removed from the calendar.`
    if (result.warnings && result.warnings.length > 0) {
      message += ` Note: ${result.warnings.join(", ")}`
    }
    showNotification(message, "success")
    await loadFixtureStatistics()
    setTimeout(() => setActiveAction(null), 2000)
  }

  // Club success handlers
  const handleAddClubSuccess = async (result) => {
    console.log("Club added successfully:", result)
    const clubName = result?.data?.clubName || "New club"
    showNotification(
      `✅ ${clubName} has been successfully added to the alliance!`,
      "success"
    )
    await loadClubStatistics()
    setTimeout(() => setActiveAction(null), 2000)
  }

  const handleEditClubSuccess = async (result) => {
    console.log("Club updated successfully:", result)
    const clubName = result?.data?.clubName || "Club"
    showNotification(
      `✅ ${clubName} information has been successfully updated!`,
      "success"
    )
    await loadClubStatistics()
    setTimeout(() => setActiveAction(null), 2000)
  }

  const handleDeleteClubSuccess = async (result) => {
    console.log("Club deleted successfully:", result)
    let message = `✅ Golf club has been successfully removed from the alliance.`
    if (result.warnings && result.warnings.length > 0) {
      message += ` Note: ${result.warnings.join(", ")}`
    }
    showNotification(message, "success")
    await loadClubStatistics()
    setTimeout(() => setActiveAction(null), 2000)
  }

  const handleCloseAction = () => {
    setActiveAction(null)
    setNotification(null)
  }

  const handleViewChange = (view) => {
    setActiveView(view)
    setActiveAction(null)
    setNotification(null)
  }

  return (
    <div className="bg-gray-100 p-4 md:p-6 rounded-lg shadow-lg ">
      <div className="flex items-center justify-center mb-6">
        <h2 className="text-xl md:text-2xl font-bold">Data Management</h2>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`mb-4 p-3 md:p-4 rounded-lg border-l-4 ${
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
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex bg-green-700 rounded-lg p-1">
          <button
            onClick={() => handleViewChange("fixtures")}
            className={`flex-1 px-4 py-3 rounded-md text-lg font-bold transition-colors ${
              activeView === "fixtures"
                ? "bg-green-600 text-white"
                : "text-green-200 hover:text-white"
            }`}>
            <Calendar className="w-5 h-5 inline mr-2" />
            Fixtures
          </button>
          <button
            onClick={() => handleViewChange("clubs")}
            className={`flex-1 px-4 py-3 rounded-md text-lg font-bold transition-colors ${
              activeView === "clubs"
                ? "bg-green-600 text-white"
                : "text-green-200 hover:text-white"
            }`}>
            <Users className="w-5 h-5 inline mr-2" />
            Clubs
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full">
        {activeAction ? (
          <div>
            {/* Render action components */}
            {activeView === "fixtures" && (
              <>
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
              </>
            )}

            {activeView === "clubs" && (
              <>
                {activeAction === "add" && (
                  <AddClub
                    onClose={handleCloseAction}
                    onSuccess={handleAddClubSuccess}
                  />
                )}
                {activeAction === "edit" && (
                  <EditClub
                    onClose={handleCloseAction}
                    onSuccess={handleEditClubSuccess}
                  />
                )}
                {activeAction === "delete" && (
                  <DeleteClub
                    onClose={handleCloseAction}
                    onSuccess={handleDeleteClubSuccess}
                  />
                )}
              </>
            )}
          </div>
        ) : (
          <div>
            {/* Fixtures View */}
            {activeView === "fixtures" && (
              <div>
                <div className="flex flex-col md:flex-row md:justify-center md:items-center mb-4 md:mb-6">
                  <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-0 text-center">
                    Manage Fixtures
                  </h3>
                  {isLoadingStats && (
                    <div className="flex items-center gap-2 ">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-300"></div>
                      <span className="text-sm">Loading...</span>
                    </div>
                  )}
                </div>

                <p className=" mb-4 md:mb-6 text-sm md:text-base">
                  Add new fixtures to the competition calendar, edit existing
                  fixture details, or remove fixtures that have been cancelled.
                </p>

                {/* Quick Stats */}
                {!isLoadingStats && (
                  <div className="flex flex-wrap justify-center mb-6 gap-3">
                    <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg font-bold text-sm">
                      {fixturesCount} Total{" "}
                      {fixturesCount === 1 ? "Fixture" : "Fixtures"}
                    </div>
                    <div className="bg-green-100 text-green-800 px-3 py-2 rounded-lg font-bold text-sm">
                      {upcomingFixtures} Upcoming
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    className="w-full bg-green-600 hover:bg-green-500 text-white px-4 md:px-6 py-3 rounded transition duration-300 font-bold flex items-center justify-center gap-2 text-sm md:text-base"
                    onClick={() => setActiveAction("add")}>
                    <Plus className="w-4 h-4 md:w-5 md:h-5" />
                    Add New Fixture
                  </button>

                  <button
                    className="w-full bg-green-600 hover:bg-green-500 text-white px-4 md:px-6 py-3 rounded transition duration-300 font-bold flex items-center justify-center gap-2 text-sm md:text-base"
                    onClick={() => setActiveAction("edit")}>
                    <Edit className="w-4 h-4 md:w-5 md:h-5" />
                    Edit Fixture
                  </button>

                  <button
                    className="w-full bg-red-600 text-white px-4 md:px-6 py-3 rounded hover:bg-red-700 transition duration-300 font-bold flex items-center justify-center gap-2 text-sm md:text-base"
                    onClick={() => setActiveAction("delete")}>
                    <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                    Delete Fixture
                  </button>
                </div>
              </div>
            )}

            {/* Clubs View */}
            {activeView === "clubs" && (
              <div>
                <div className="flex flex-col md:flex-row md:justify-center md:items-center mb-4 md:mb-6">
                  <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-0 text-center">
                    Manage Golf Clubs
                  </h3>
                  {isLoadingStats && (
                    <div className="flex items-center gap-2 text-green-300">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-300"></div>
                      <span className="text-sm">Loading...</span>
                    </div>
                  )}
                </div>

                <p className="mb-4 md:mb-6 text-sm md:text-base">
                  Add new golf clubs to the alliance, edit existing club
                  information, or remove clubs that are no longer part of the
                  alliance.
                </p>

                {/* Quick Stats */}
                {!isLoadingStats && (
                  <div className="mb-6">
                    <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg font-bold text-sm inline-block">
                      {clubsCount} {clubsCount === 1 ? "Club" : "Clubs"} in
                      Alliance
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    className="w-full bg-green-600 hover:bg-green-500 text-white px-4 md:px-6 py-3 rounded transition duration-300 font-bold flex items-center justify-center gap-2 text-sm md:text-base"
                    onClick={() => setActiveAction("add")}>
                    <Plus className="w-4 h-4 md:w-5 md:h-5" />
                    Add New Golf Club
                  </button>

                  <button
                    className="w-full bg-green-600 hover:bg-green-500 text-white px-4 md:px-6 py-3 rounded transition duration-300 font-bold flex items-center justify-center gap-2 text-sm md:text-base"
                    onClick={() => setActiveAction("edit")}>
                    <Edit className="w-4 h-4 md:w-5 md:h-5" />
                    Edit Golf Club
                  </button>

                  <button
                    className="w-full bg-red-600 text-white px-4 md:px-6 py-3 rounded hover:bg-red-700 transition duration-300 font-bold flex items-center justify-center gap-2 text-sm md:text-base"
                    onClick={() => setActiveAction("delete")}>
                    <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                    Delete Golf Club
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default UnifiedManagement
