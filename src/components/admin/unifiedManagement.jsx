import { useState, useEffect } from "react"
import {
  Calendar,
  Users,
  Plus,
  Edit,
  Trash2,
  X,
  UserCheck,
  Trophy,
  Shield,
} from "lucide-react"

// Import your existing sub-components
import AddFixture from "./manageFixtures/addFixture"
import EditFixture from "./manageFixtures/editFixture"
import DeleteFixture from "./manageFixtures/deleteFixture"
import AddClub from "./manageClubs/addClub"
import EditClub from "./manageClubs/editClub"
import DeleteClub from "./manageClubs/deleteClub"
import AddGolfer from "./manageGolfers/addGolfer"
import EditGolfer from "./manageGolfers/editGolfer"
import DeleteGolfer from "./manageGolfers/deleteGolfer"
import AddScore from "./manageScores/addScore"
import EditScore from "./manageScores/editScore"
import DeleteScore from "./manageScores/deleteScore"
// Import new officer components
import AddOfficer from "./manageOfficers/addOfficers"
import EditOfficer from "./manageOfficers/editOfficers"
import DeleteOfficer from "./manageOfficers/deleteOfficers"

// Import your API functions
import { getAllFixtures } from "../../utils/api/fixturesApi"
import { getAllGolfClubs } from "../../utils/api/clubsApi"
import { getAllGolfers } from "../../utils/api/golfersApi"
import { getAllScores } from "../../utils/api/scoresApi"
import { getAllOfficers } from "../../utils/api/officersApi"

const UnifiedManagement = () => {
  const [activeView, setActiveView] = useState("fixtures")
  const [activeAction, setActiveAction] = useState(null)
  const [notification, setNotification] = useState(null)

  // Fixtures stats
  const [fixturesCount, setFixturesCount] = useState(0)
  const [upcomingFixtures, setUpcomingFixtures] = useState(0)

  // Clubs stats
  const [clubsCount, setClubsCount] = useState(0)

  // Golfers stats
  const [golfersCount, setGolfersCount] = useState(0)
  const [proCount, setProCount] = useState(0)
  const [seniorCount, setSeniorCount] = useState(0)

  // Officers stats
  const [officersCount, setOfficersCount] = useState(0)

  // Scores stats
  // const [scoresCount, setScoresCount] = useState(0)

  const [isLoadingStats, setIsLoadingStats] = useState(false)

  // Load initial statistics
  useEffect(() => {
    loadAllStatistics()
  }, [])

  const loadAllStatistics = async () => {
    setIsLoadingStats(true)
    try {
      await Promise.all([
        loadFixtureStatistics(),
        loadClubStatistics(),
        loadGolferStatistics(),
        loadOfficerStatistics(),
        loadScoreStatistics(),
      ])
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

  const loadGolferStatistics = async () => {
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
    }
  }

  const loadOfficerStatistics = async () => {
    try {
      const officers = await getAllOfficers()
      setOfficersCount(officers.length)
    } catch (error) {
      console.error("Error loading officer statistics:", error)
    }
  }

  const loadScoreStatistics = async () => {
    try {
      await getAllScores()
      // setScoresCount(scores.length)
    } catch (error) {
      console.error("Error loading score statistics:", error)
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

  const handleViewChange = (view) => {
    setActiveView(view)
    setActiveAction(null) // Reset action when changing views
  }

  const handleCloseAction = () => {
    setActiveAction(null)
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
      ? ` for ${new Date(eventDate).toLocaleDateString("en-GB")}`
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
    showNotification(
      `✅ Fixture has been successfully removed from the calendar.`,
      "success"
    )
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
    showNotification(
      `✅ Golf club has been successfully removed from the alliance.`,
      "success"
    )
    await loadClubStatistics()
    setTimeout(() => setActiveAction(null), 2000)
  }

  // Golfer success handlers
  const handleAddGolferSuccess = async (result) => {
    console.log("Golfer added successfully:", result)
    const golferName = result?.data?.golferName || "New golfer"
    showNotification(
      `✅ ${golferName} has been successfully added to the system!`,
      "success"
    )
    await loadGolferStatistics()
    setTimeout(() => setActiveAction(null), 2000)
  }

  const handleEditGolferSuccess = async (result) => {
    console.log("Golfer updated successfully:", result)
    const golferName = result?.data?.golferName || "Golfer"
    showNotification(
      `✅ ${golferName} information has been successfully updated!`,
      "success"
    )
    await loadGolferStatistics()
    setTimeout(() => setActiveAction(null), 2000)
  }

  const handleDeleteGolferSuccess = async (result) => {
    console.log("Golfer deleted successfully:", result)
    showNotification(
      `✅ Golfer has been successfully removed from the system.`,
      "success"
    )
    await loadGolferStatistics()
    setTimeout(() => setActiveAction(null), 2000)
  }

  // Officer success handlers
  const handleAddOfficerSuccess = async (result) => {
    console.log("Officer added successfully:", result)
    const officerName = result?.data?.Name || "New officer"
    showNotification(
      `✅ ${officerName} has been successfully added as an officer!`,
      "success"
    )
    await loadOfficerStatistics()
    setTimeout(() => setActiveAction(null), 2000)
  }

  const handleEditOfficerSuccess = async (result) => {
    console.log("Officer updated successfully:", result)
    const officerName = result?.data?.Name || "Officer"
    showNotification(
      `✅ ${officerName} information has been successfully updated!`,
      "success"
    )
    await loadOfficerStatistics()
    setTimeout(() => setActiveAction(null), 2000)
  }

  const handleDeleteOfficerSuccess = async (result) => {
    console.log("Officer deleted successfully:", result)
    showNotification(
      `✅ Officer has been successfully removed from the system.`,
      "success"
    )
    await loadOfficerStatistics()
    setTimeout(() => setActiveAction(null), 2000)
  }

  // Score success handlers
  const handleAddScoreSuccess = async (result) => {
    console.log("Score added successfully:", result)
    const golferName = result?.data?.golfer?.golferName || "Unknown golfer"
    const eventType = result?.data?.event?.eventType || "Unknown event"
    const score = result?.data?.golferEventScore || ""
    showNotification(
      `✅ Score of ${score} for ${golferName} in ${eventType} has been successfully recorded!`,
      "success"
    )
    await loadScoreStatistics()
    setTimeout(() => setActiveAction(null), 2000)
  }

  const handleEditScoreSuccess = async (result) => {
    console.log("Score updated successfully:", result)
    const golferName = result?.data?.golfer?.golferName || "Unknown golfer"
    const eventType = result?.data?.event?.eventType || "Unknown event"
    const score = result?.data?.golferEventScore || ""
    showNotification(
      `✅ Score for ${golferName} in ${eventType} has been successfully updated to ${score}!`,
      "success"
    )
    await loadScoreStatistics()
    setTimeout(() => setActiveAction(null), 2000)
  }

  const handleDeleteScoreSuccess = async (result) => {
    console.log("Score deleted successfully:", result)
    showNotification(
      `✅ Score has been successfully removed from the system.`,
      "success"
    )
    await loadScoreStatistics()
    setTimeout(() => setActiveAction(null), 2000)
  }

  return (
    <div className="w-full bg-gray-100 max-w-7xl mx-auto p-4">
      <h2 className="text-lg font-semibold text-center mb-6 pt-2">
        Data Management
      </h2>

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
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex bg-green-700 rounded-lg p-1 overflow-x-auto">
          <button
            onClick={() => handleViewChange("fixtures")}
            className={`flex-1 px-4 py-3 rounded-md text-sm md:text-lg font-bold transition-colors whitespace-nowrap ${
              activeView === "fixtures"
                ? "bg-green-600 text-white"
                : "text-green-200 hover:text-white"
            }`}>
            <Calendar className="w-4 h-4 md:w-5 md:h-5 inline mr-2" />
            Fixtures
          </button>
          <button
            onClick={() => handleViewChange("clubs")}
            className={`flex-1 px-4 py-3 rounded-md text-sm md:text-lg font-bold transition-colors whitespace-nowrap ${
              activeView === "clubs"
                ? "bg-green-600 text-white"
                : "text-green-200 hover:text-white"
            }`}>
            <Users className="w-4 h-4 md:w-5 md:h-5 inline mr-2" />
            Clubs
          </button>
          <button
            onClick={() => handleViewChange("golfers")}
            className={`flex-1 px-4 py-3 rounded-md text-sm md:text-lg font-bold transition-colors whitespace-nowrap ${
              activeView === "golfers"
                ? "bg-green-600 text-white"
                : "text-green-200 hover:text-white"
            }`}>
            <UserCheck className="w-4 h-4 md:w-5 md:h-5 inline mr-2" />
            Golfers
          </button>
          <button
            onClick={() => handleViewChange("officers")}
            className={`flex-1 px-4 py-3 rounded-md text-sm md:text-lg font-bold transition-colors whitespace-nowrap ${
              activeView === "officers"
                ? "bg-green-600 text-white"
                : "text-green-200 hover:text-white"
            }`}>
            <Shield className="w-4 h-4 md:w-5 md:h-5 inline mr-2" />
            Officers
          </button>
          <button
            onClick={() => handleViewChange("scores")}
            className={`flex-1 px-4 py-3 rounded-md text-sm md:text-lg font-bold transition-colors whitespace-nowrap ${
              activeView === "scores"
                ? "bg-green-600 text-white"
                : "text-green-200 hover:text-white"
            }`}>
            <Trophy className="w-4 h-4 md:w-5 md:h-5 inline mr-2" />
            Scores
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

            {activeView === "golfers" && (
              <>
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
              </>
            )}

            {activeView === "officers" && (
              <>
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
              </>
            )}

            {activeView === "scores" && (
              <>
                {activeAction === "add" && (
                  <AddScore
                    onClose={handleCloseAction}
                    onSuccess={handleAddScoreSuccess}
                  />
                )}
                {activeAction === "edit" && (
                  <EditScore
                    onClose={handleCloseAction}
                    onSuccess={handleEditScoreSuccess}
                  />
                )}
                {activeAction === "delete" && (
                  <DeleteScore
                    onClose={handleCloseAction}
                    onSuccess={handleDeleteScoreSuccess}
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
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-300"></div>
                      <span className="text-sm">Loading...</span>
                    </div>
                  )}
                </div>

                <p className="mb-4 md:mb-6 text-sm md:text-base">
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

            {/* Golfers View */}
            {activeView === "golfers" && (
              <div>
                <div className="flex flex-col md:flex-row md:justify-center md:items-center mb-4 md:mb-6">
                  <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-0 text-center">
                    Manage Golfers
                  </h3>
                  {isLoadingStats && (
                    <div className="flex items-center gap-2 text-green-300">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-300"></div>
                      <span className="text-sm">Loading...</span>
                    </div>
                  )}
                </div>

                <p className="mb-4 md:mb-6 text-sm md:text-base">
                  Add new golfers to the system, edit existing golfer
                  information, or remove golfers who are no longer active.
                </p>

                {/* Quick Stats */}
                {!isLoadingStats && (
                  <div className="flex flex-wrap justify-center mb-6 gap-3">
                    <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg font-bold text-sm">
                      {golfersCount} Total{" "}
                      {golfersCount === 1 ? "Golfer" : "Golfers"}
                    </div>
                    <div className="bg-green-100 text-green-800 px-3 py-2 rounded-lg font-bold text-sm">
                      {proCount} {proCount === 1 ? "Pro" : "Pros"}
                    </div>
                    <div className="bg-purple-100 text-purple-800 px-3 py-2 rounded-lg font-bold text-sm">
                      {seniorCount} {seniorCount === 1 ? "Senior" : "Seniors"}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    className="w-full bg-green-600 hover:bg-green-500 text-white px-4 md:px-6 py-3 rounded transition duration-300 font-bold flex items-center justify-center gap-2 text-sm md:text-base"
                    onClick={() => setActiveAction("add")}>
                    <Plus className="w-4 h-4 md:w-5 md:h-5" />
                    Add New Golfer
                  </button>

                  <button
                    className="w-full bg-green-600 hover:bg-green-500 text-white px-4 md:px-6 py-3 rounded transition duration-300 font-bold flex items-center justify-center gap-2 text-sm md:text-base"
                    onClick={() => setActiveAction("edit")}>
                    <Edit className="w-4 h-4 md:w-5 md:h-5" />
                    Edit Golfer
                  </button>

                  <button
                    className="w-full bg-red-600 text-white px-4 md:px-6 py-3 rounded hover:bg-red-700 transition duration-300 font-bold flex items-center justify-center gap-2 text-sm md:text-base"
                    onClick={() => setActiveAction("delete")}>
                    <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                    Delete Golfer
                  </button>
                </div>
              </div>
            )}

            {/* Officers View */}
            {activeView === "officers" && (
              <div>
                <div className="flex flex-col md:flex-row md:justify-center md:items-center mb-4 md:mb-6">
                  <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-0 text-center">
                    Manage Club Officers
                  </h3>
                  {isLoadingStats && (
                    <div className="flex items-center gap-2 text-green-300">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-300"></div>
                      <span className="text-sm">Loading...</span>
                    </div>
                  )}
                </div>

                <p className="mb-4 md:mb-6 text-sm md:text-base">
                  Add new club officers, edit existing officer information, or
                  remove officers who are no longer active.
                </p>

                {/* Quick Stats */}
                {!isLoadingStats && (
                  <div className="mb-6">
                    <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg font-bold text-sm inline-block">
                      {officersCount}{" "}
                      {officersCount === 1 ? "Officer" : "Officers"}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    className="w-full bg-green-600 hover:bg-green-500 text-white px-4 md:px-6 py-3 rounded transition duration-300 font-bold flex items-center justify-center gap-2 text-sm md:text-base"
                    onClick={() => setActiveAction("add")}>
                    <Plus className="w-4 h-4 md:w-5 md:h-5" />
                    Add New Officer
                  </button>

                  <button
                    className="w-full bg-green-600 hover:bg-green-500 text-white px-4 md:px-6 py-3 rounded transition duration-300 font-bold flex items-center justify-center gap-2 text-sm md:text-base"
                    onClick={() => setActiveAction("edit")}>
                    <Edit className="w-4 h-4 md:w-5 md:h-5" />
                    Edit Officer
                  </button>

                  <button
                    className="w-full bg-red-600 text-white px-4 md:px-6 py-3 rounded hover:bg-red-700 transition duration-300 font-bold flex items-center justify-center gap-2 text-sm md:text-base"
                    onClick={() => setActiveAction("delete")}>
                    <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                    Delete Officer
                  </button>
                </div>
              </div>
            )}

            {/* Scores View */}
            {activeView === "scores" && (
              <div>
                <div className="flex flex-col md:flex-row md:justify-center md:items-center mb-4 md:mb-6">
                  <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-0 text-center">
                    Manage Scores
                  </h3>
                  {isLoadingStats && (
                    <div className="flex items-center gap-2 text-green-300">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-300"></div>
                      <span className="text-sm">Loading...</span>
                    </div>
                  )}
                </div>

                <p className="mb-4 md:mb-6 text-sm md:text-base">
                  Record new scores for golfers in events, edit existing scores,
                  or remove incorrect or duplicate score entries.
                </p>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    className="w-full bg-green-600 hover:bg-green-500 text-white px-4 md:px-6 py-3 rounded transition duration-300 font-bold flex items-center justify-center gap-2 text-sm md:text-base"
                    onClick={() => setActiveAction("add")}>
                    <Plus className="w-4 h-4 md:w-5 md:h-5" />
                    Add New Score
                  </button>

                  <button
                    className="w-full bg-green-600 hover:bg-green-500 text-white px-4 md:px-6 py-3 rounded transition duration-300 font-bold flex items-center justify-center gap-2 text-sm md:text-base"
                    onClick={() => setActiveAction("edit")}>
                    <Edit className="w-4 h-4 md:w-5 md:h-5" />
                    Edit Score
                  </button>

                  <button
                    className="w-full bg-red-600 text-white px-4 md:px-6 py-3 rounded hover:bg-red-700 transition duration-300 font-bold flex items-center justify-center gap-2 text-sm md:text-base"
                    onClick={() => setActiveAction("delete")}>
                    <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                    Delete Score
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
