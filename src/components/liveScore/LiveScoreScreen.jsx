import { useState, useEffect, useCallback, useMemo } from "react"
import { useLiveScore } from "../../constants/LiveScoreContext"
import { MODELS, QUERIES } from "../../constants/api"
import useFetch from "../../utils/hooks/useFetch"
import { queryBuilder } from "../../utils/queryBuilder"

import { Header } from "./Header"
import { TopClubs } from "./TopClubs"
import { ClubCard } from "./ClubCard"
import { LoadingState } from "./LoadingState"
import { TVControls } from "./TVControls"
import { TVHeader } from "./TVHeader"
import { Styles } from "./Styles"
import VerticalInfiniteScroll from "./VerticalInfiniteScroll"

const LiveScoreScreen = ({ eventId, eventData }) => {
  const { getEventStatus, updateEventResults } = useLiveScore()
  const [autoRefreshEnabled] = useState(true)
  const [tvViewMode, setTvViewMode] = useState(false)
  const [isScrolling, setIsScrolling] = useState(true)

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

  // Optimized refresh intervals - slower when TV scrolling to prevent jumpiness
  useEffect(() => {
    if (!autoRefreshEnabled) return

    // Use longer interval during TV auto-scroll to prevent jumpiness
    const interval = tvViewMode && isScrolling ? 120000 : 60000 // 2 min vs 1 min

    const refreshTimer = setInterval(handleRefresh, interval)
    return () => clearInterval(refreshTimer)
  }, [autoRefreshEnabled, handleRefresh, tvViewMode, isScrolling])

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
        const golfers = teeTime?.golfers || []
        golfers.forEach((golfer) => {
          const golferAttributes = golfer?.attributes || golfer || {}
          const clubName =
            golferAttributes?.golf_club?.clubName || "Unaffiliated"

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
        if (score?.golfer) {
          const clubName = score.golfer?.golf_club?.clubName || "Unaffiliated"


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

  const getTop4Clubs = useCallback((clubGroups) => {
    const clubScores = {}

    clubGroups.forEach((club) => {
      club.players.forEach((player) => {
        if (!player.hasScores || player.isNIT) return

        const clubName = club.clubName
        if (!clubScores[clubName]) {
          clubScores[clubName] = []
        }

        clubScores[clubName].push({
          golferEventScore: player.total,
          back9Score: player.backNine,
          golferName: player.name,
        })
      })
    })

    const teamScores = Object.entries(clubScores).map(([clubName, scores]) => {
      const sortedClubScores = [...scores].sort(
        (a, b) => b.golferEventScore - a.golferEventScore
      )

      const topScores = sortedClubScores.slice(0, 4)

      const totalPoints = topScores.reduce(
        (sum, score) => sum + score.golferEventScore,
        0
      )

      const totalBack9 = topScores.reduce(
        (sum, score) => sum + (score.back9Score != null ? score.back9Score : 0),
        0
      )

      return {
        clubName,
        totalPoints,
        totalBack9,
        playersCount: topScores.length,
        totalPlayersWithScores: scores.length,
      }
    })

    const sortedTeams = [...teamScores].sort((a, b) => {
      const pointsDiff = b.totalPoints - a.totalPoints
      if (pointsDiff !== 0) return pointsDiff
      return b.totalBack9 - a.totalBack9
    })

    return sortedTeams.slice(0, 4).map((team) => ({
      clubName: team.clubName,
      averageScore: team.totalPoints,
      playersWithScores: team.totalPlayersWithScores,
      totalPlayers:
        clubGroups.find((c) => c.clubName === team.clubName)?.totalPlayers || 0,
      teamTotal: team.totalPoints,
      playersInTeam: team.playersCount,
    }))
  }, [])

  const currentEventData = liveEventData || eventData

  // Memoize expensive calculations to prevent unnecessary re-renders
  const { clubGroups } = useMemo(
    () => processClubGroupedScores(currentEventData, teeTimesData),
    [currentEventData, teeTimesData, processClubGroupedScores]
  )

  const top4Clubs = useMemo(
    () => getTop4Clubs(clubGroups),
    [clubGroups, getTop4Clubs]
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

      // Only update if there are actual changes
      if (JSON.stringify(flatScores) !== JSON.stringify(currentScores)) {
        // Delay updates during TV auto-scroll to prevent jumpiness
        const updateDelay = tvViewMode && isScrolling ? 1000 : 0

        setTimeout(() => {
          updateEventResults(eventId, flatScores)
        }, updateDelay)
      }
    }
  }, [clubGroups, eventId, updateEventResults, tvViewMode, isScrolling])

  const handleScrollToggle = useCallback(() => {
    setIsScrolling(!isScrolling)
  }, [isScrolling])

  const TVView = () => (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 z-[9999] overflow-hidden">
      <TVControls
        onExit={() => setTvViewMode(false)}
        isScrolling={isScrolling}
        onScrollToggle={handleScrollToggle}
      />

      <TVHeader currentEventData={currentEventData} eventData={eventData} />
      <TopClubs top4Clubs={top4Clubs} />

      <div className="h-full overflow-hidden bg-gradient-to-b from-slate-50 to-gray-100">
        {teeTimesError ? (
          <LoadingState
            hasError
            errorMessage="Unable to load tournament data"
          />
        ) : clubGroups.length > 0 && !isTeeTimesLoading ? (
          <VerticalInfiniteScroll
            velocity={-50}
            isScrolling={isScrolling}
            onScrollToggle={handleScrollToggle}
            containerHeight="calc(100vh - 200px)">
            {" "}
            {/* Adjusted for taller bottom bar */}
            <div className="p-8 pb-20">
              {" "}
              {/* Extra bottom padding */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {clubGroups.map((club) => (
                  <ClubCard key={club.clubName} club={club} />
                ))}
              </div>
            </div>
          </VerticalInfiniteScroll>
        ) : (
          <LoadingState
            isLoading={isEventLoading || isTeeTimesLoading}
            hasError={false}
          />
        )}

        <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm text-white py-4 px-8">
          {" "}
          {/* Changed py-2 to py-4 */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span>Live Tournament Coverage</span>
              </div>
            </div>
            <div className="text-slate-300">
              {isScrolling
                ? "Auto-scrolling • Click button to pause and enable manual scroll"
                : "Manual scroll enabled • Click button to resume auto-scroll"}{" "}
              • ESC to exit • SPACE to pause
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const RegularView = () => (
    <div className="page-container">
      <div className="content-card">
        <Header
          currentEventData={currentEventData}
          eventData={eventData}
          onTvViewToggle={() => setTvViewMode(true)}
        />

        <TopClubs top4Clubs={top4Clubs} isRegularView />

        <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center space-x-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span>Live Leaderboard - By Club</span>
        </h2>

        <div
          className="regular-view-content"
          style={{
            maxHeight: "",
            overflowY: "auto",
          }}>
          {teeTimesError ? (
            <LoadingState
              hasError
              errorMessage="Error loading tee times data"
            />
          ) : clubGroups.length > 0 && !isTeeTimesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clubGroups.map((club) => (
                <ClubCard key={club.clubName} club={club} isRegularView />
              ))}
            </div>
          ) : (
            <LoadingState
              isLoading={isEventLoading || isTeeTimesLoading}
              hasError={false}
            />
          )}
        </div>


        <div className="border-b border-gray-300 my-5"></div>
        <div className="text-center text-gray-600 text-sm">
          Scores update automatically every minute • Results will be officially
          released once tournament is complete
        </div>

        <Styles />
      </div>
    </div>
  )

  return <>{tvViewMode ? <TVView /> : <RegularView />}</>
}

export default LiveScoreScreen
