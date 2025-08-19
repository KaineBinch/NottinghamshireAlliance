import { useState, useEffect, useCallback } from "react"
import { Trophy, Monitor, X } from "lucide-react"
import { useLiveScore } from "../../constants/LiveScoreContext"
import { MODELS, QUERIES } from "../../constants/api"
import useFetch from "../../utils/hooks/useFetch"
import { queryBuilder } from "../../utils/queryBuilder"

const LiveScoreScreen = ({ eventId, eventData }) => {
  const { getEventStatus, updateEventResults } = useLiveScore()
  const [autoRefreshEnabled] = useState(true) // Only need the value, not the setter
  const [tvViewMode, setTvViewMode] = useState(false)

  // Fetch event data with scores
  const eventQuery = queryBuilder(MODELS.events, QUERIES.resultsQuery)
  const {
    data: allEventsData,
    isLoading: isEventLoading,
    refetch,
  } = useFetch(eventQuery)

  // Fetch tee times data, filtered by eventId
  const teeTimesQuery = queryBuilder(
    MODELS.teeTimes,
    `${QUERIES.teeTimesQuery}&filters[event][id][$eq]=${eventId}`
  )
  const {
    data: teeTimesData,
    isLoading: isTeeTimesLoading,
    error: teeTimesError,
  } = useFetch(teeTimesQuery)

  const liveEventData = allEventsData?.data?.find(
    (event) => event.id.toString() === eventId
  )
  const eventStatus = getEventStatus(eventId)

  const handleRefresh = useCallback(async () => {
    await refetch()
  }, [refetch])

  useEffect(() => {
    if (!autoRefreshEnabled) return
    const interval = setInterval(handleRefresh, 60000)
    return () => clearInterval(interval)
  }, [autoRefreshEnabled, handleRefresh])

  // Handle escape key to exit TV view
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape" && tvViewMode) {
        setTvViewMode(false)
      }
    }

    document.addEventListener("keydown", handleEscKey)
    return () => document.removeEventListener("keydown", handleEscKey)
  }, [tvViewMode])

  const processClubGroupedScores = useCallback((eventData, teeTimes) => {
    const clubGroups = {}

    // Initialize clubs from tee times
    if (teeTimes?.data) {
      teeTimes.data.forEach((teeTime) => {
        const golfers = teeTime.golfers || []
        golfers.forEach((golfer) => {
          const golferAttributes = golfer.attributes || golfer
          const clubName =
            golferAttributes.golf_club?.clubName || "Unaffiliated"

          if (!clubGroups[clubName]) {
            clubGroups[clubName] = {
              clubName,
              players: [],
              playersWithScores: 0,
              totalPlayers: 0,
            }
          }

          if (
            !clubGroups[clubName].players.some(
              (player) => player.name === golferAttributes.golferName
            )
          ) {
            clubGroups[clubName].players.push({
              name: golferAttributes.golferName || "Unknown Golfer",
              frontNine: null,
              backNine: null,
              total: null,
              isPro: golferAttributes.isPro || false,
              isSenior: golferAttributes.isSenior || false,
              isNIT: teeTime.isNIT || false,
              hasScores: false,
            })
            clubGroups[clubName].totalPlayers++
          }
        })
      })
    }

    // Update with scores from event data
    if (eventData?.scores) {
      eventData.scores.forEach((score) => {
        if (score.golfer) {
          const clubName = score.golfer.golf_club?.clubName || "Unaffiliated"

          if (!clubGroups[clubName]) {
            clubGroups[clubName] = {
              clubName,
              players: [],
              playersWithScores: 0,
              totalPlayers: 0,
            }
          }

          const existingPlayer = clubGroups[clubName].players.find(
            (player) => player.name === score.golfer.golferName
          )

          const playerData = {
            name: score.golfer.golferName,
            frontNine: score.front9Score || null,
            backNine: score.back9Score || null,
            total: score.golferEventScore || null,
            isPro: score.golfer.isPro,
            isSenior: score.golfer.isSenior,
            isNIT: score.isNIT,
            hasScores:
              score.golferEventScore !== null &&
              score.golferEventScore !== undefined,
          }

          if (existingPlayer) {
            Object.assign(existingPlayer, playerData)
            if (playerData.hasScores) {
              clubGroups[clubName].playersWithScores++
            }
          } else {
            clubGroups[clubName].players.push(playerData)
            clubGroups[clubName].totalPlayers++
            if (playerData.hasScores) {
              clubGroups[clubName].playersWithScores++
            }
          }
        }
      })
    }

    // Sort players within each club and clubs alphabetically
    const sortedClubGroups = Object.values(clubGroups)
      .map((club) => {
        club.players.sort((a, b) => {
          if (a.hasScores && !b.hasScores) return -1
          if (!a.hasScores && b.hasScores) return 1
          if (a.hasScores && b.hasScores) return (b.total || 0) - (a.total || 0)
          return a.name.localeCompare(b.name)
        })
        return club
      })
      .sort((a, b) => a.clubName.localeCompare(b.clubName))

    return { clubGroups: sortedClubGroups }
  }, [])

  const currentEventData = liveEventData || eventData
  const { clubGroups } = processClubGroupedScores(
    currentEventData,
    teeTimesData
  )

  useEffect(() => {
    if (clubGroups.length > 0) {
      const flatScores = clubGroups.flatMap((club) =>
        club.players
          .filter((player) => player.hasScores)
          .map((player, index) => ({
            position: index + 1,
            playerName: player.name,
            club: club.clubName,
            score: player.total,
            back9Score: player.backNine,
            status: "Final",
          }))
      )

      const currentScores = eventStatus.liveResults || []
      if (JSON.stringify(flatScores) !== JSON.stringify(currentScores)) {
        updateEventResults(eventId, flatScores)
      }
    }
  }, [clubGroups, eventId, eventStatus.liveResults, updateEventResults])

  // TV View Component
  const TVView = () => (
    <div className="fixed inset-0 bg-[#D9D9D9] z-[9999] overflow-auto">
      {/* Exit button */}
      <button
        onClick={() => setTvViewMode(false)}
        className="fixed top-4 right-8 z-[10000] bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition-colors"
        title="Exit TV View (ESC)">
        <X className="w-6 h-6" />
      </button>

      {/* TV View Header */}
      <div className="bg-[#214A27] text-white py-6 px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2">
            {currentEventData?.golf_club?.clubName
              ? `${currentEventData.golf_club.clubName} Golf Club`
              : "Live Tournament"}
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl mb-2">
            {currentEventData?.eventType || "Competition"}
          </p>
          <p className="text-lg md:text-xl lg:text-2xl">
            {currentEventData?.eventDate || eventData?.eventDate}
          </p>
        </div>
      </div>

      {/* TV View Content */}
      <div className="p-6 md:p-8 lg:p-12">
        {teeTimesError ? (
          <div className="text-center py-16">
            <Trophy className="w-24 h-24 mx-auto mb-8 text-gray-400" />
            <p className="text-3xl font-medium text-gray-700">
              Error loading tee times data
            </p>
            <p className="text-xl mt-4 text-gray-600">
              Unable to fetch club information. Please try again later.
            </p>
          </div>
        ) : clubGroups.length > 0 && !isTeeTimesLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6 lg:gap-8">
            {clubGroups.map((club) => (
              <div
                key={club.clubName}
                className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-[#214A27] text-white p-3 md:p-4">
                  <h3 className="font-bold text-sm md:text-base lg:text-lg text-center truncate">
                    {club.clubName}
                  </h3>
                  <p className="text-xs md:text-sm text-center mt-1 opacity-90">
                    ({club.playersWithScores}/{club.totalPlayers} finished)
                  </p>
                </div>
                <div className="p-2 md:p-3">
                  <table className="w-full text-xs md:text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="text-left p-1 font-semibold">Player</th>
                        <th className="text-center p-1 font-semibold w-12">
                          F9
                        </th>
                        <th className="text-center p-1 font-semibold w-12">
                          B9
                        </th>
                        <th className="text-center p-1 font-semibold w-12">
                          Tot
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {club.players.map((player, index) => (
                        <tr
                          key={`${player.name}-${index}`}
                          className={
                            index % 2 === 0 ? "bg-gray-50" : "bg-white"
                          }>
                          <td className="p-1 text-left text-xs md:text-sm">
                            <div className="truncate">
                              {player.isNIT && (
                                <span className="text-orange-500 font-bold mr-2">
                                  NIT
                                </span>
                              )}
                              {player.name}
                              {player.isPro && (
                                <span className="text-blue-600 font-bold ml-1">
                                  P
                                </span>
                              )}
                              {player.isSenior && (
                                <span className="text-red-500 font-bold ml-1">
                                  S
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="text-center p-1">
                            {player.hasScores ? player.frontNine : "-"}
                          </td>
                          <td className="text-center p-1">
                            {player.hasScores ? player.backNine : "-"}
                          </td>
                          <td className="text-center p-1 font-bold">
                            {player.hasScores ? player.total : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Trophy className="w-24 h-24 mx-auto mb-8 text-gray-400" />
            <p className="text-3xl font-medium text-gray-700">
              {isEventLoading || isTeeTimesLoading
                ? "Loading tournament data..."
                : "No clubs registered yet"}
            </p>
            <p className="text-xl mt-4 text-gray-600">
              {isEventLoading || isTeeTimesLoading
                ? "Please wait..."
                : "Clubs will appear here once players are registered"}
            </p>
          </div>
        )}

        {/* Live update indicator */}
        <div className="text-center mt-8">
          <p className="text-lg md:text-xl text-gray-700">
            📺 TV View Mode • Updates every minute • Press ESC to exit
          </p>
        </div>
      </div>
    </div>
  )

  // Regular View Component
  const RegularView = () => (
    <div className="page-container">
      <div className="content-card">
        <header className="event-header relative">
          {/* TV View Button - Absolute positioned in top right of header */}
          <button
            onClick={() => setTvViewMode(true)}
            className="absolute top-4 right-4 bg-[#214A27] text-white px-4 py-2 rounded-lg shadow-md hover:bg-[#17331B] transition-colors flex items-center gap-2"
            title="Switch to TV View for large displays">
            <Monitor className="w-5 h-5" />
            TV View
          </button>

          <div className="flex justify-center items-center">
            <div>
              <h1 className="event-title">
                {currentEventData?.golf_club?.clubName || "Live Tournament"}
              </h1>
              <p className="event-type">
                {currentEventData?.eventType || "Competition"}
              </p>
              <p className="event-date">
                Date: {currentEventData?.eventDate || eventData?.eventDate}
              </p>
            </div>
          </div>
        </header>

        <h2 className="section-title">Live Leaderboard - By Club</h2>

        {teeTimesError ? (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Error loading tee times data</p>
            <p className="text-sm">
              Unable to fetch club information. Please try again later.
            </p>
          </div>
        ) : clubGroups.length > 0 && !isTeeTimesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {clubGroups.map((club) => (
              <div key={club.clubName} className="mb-5">
                <h3 className="text-[#214A27] font-bold text-sm mb-1">
                  {club.clubName}
                  <span className="text-gray-600 font-normal text-xs ml-2">
                    ({club.playersWithScores}/{club.totalPlayers} finished)
                  </span>
                </h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#214A27] text-white">
                      <th className="border border-gray-300 p-1 text-xs">
                        Player
                      </th>
                      <th className="border border-gray-300 p-1 text-center text-xs">
                        F9
                      </th>
                      <th className="border border-gray-300 p-1 text-center text-xs">
                        B9
                      </th>
                      <th className="border border-gray-300 p-1 text-center text-xs">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {club.players.map((player, index) => (
                      <tr
                        key={`${player.name}-${index}`}
                        className={
                          index % 2 === 0 ? "bg-[#d9d9d9]" : "bg-white"
                        }>
                        <td className="border border-gray-300 p-1 text-xs">
                          <div>
                            {player.isNIT && (
                              <span className="golfer-nit-tag mr-1">NIT</span>
                            )}
                            {player.name}
                            {player.isPro && (
                              <span className="golfer-pro-tag">Pro</span>
                            )}
                            {player.isSenior && (
                              <span className="golfer-senior-tag">Senior</span>
                            )}
                          </div>
                        </td>
                        <td className="border border-gray-300 p-1 text-center text-sm">
                          {player.hasScores ? player.frontNine : "-"}
                        </td>
                        <td className="border border-gray-300 p-1 text-center text-sm">
                          {player.hasScores ? player.backNine : "-"}
                        </td>
                        <td className="border border-gray-300 p-1 text-center">
                          <div className="text-sm font-bold">
                            {player.hasScores ? player.total : "-"}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {club.players.length === 0 && (
                      <tr className="bg-white">
                        <td
                          colSpan="4"
                          className="border border-gray-300 p-2 text-center text-xs text-gray-500 italic">
                          No players registered yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">
              {isEventLoading || isTeeTimesLoading
                ? "Loading tournament data..."
                : "No clubs registered yet"}
            </p>
            <p className="text-sm">
              {isEventLoading || isTeeTimesLoading
                ? "Please wait..."
                : "Clubs will appear here once players are registered"}
            </p>
          </div>
        )}

        <div className="border-b border-gray-300 my-5"></div>
        <div className="text-center text-gray-600 text-sm">
          Scores update automatically every minute • Results will be officially
          released once tournament is complete
        </div>
      </div>
    </div>
  )

  return <>{tvViewMode ? <TVView /> : <RegularView />}</>
}

export default LiveScoreScreen
