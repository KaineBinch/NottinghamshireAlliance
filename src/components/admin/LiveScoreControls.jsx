import { useState } from "react"
import {
  Play,
  Square,
  CheckCircle,
  Eye,
  RefreshCw,
  Settings,
} from "lucide-react"
import { useLiveScore } from "../../constants/LiveScoreContext"
import { MODELS, QUERIES } from "../../constants/api"
import useFetch from "../../utils/hooks/useFetch"
import { queryBuilder } from "../../utils/queryBuilder"

const LiveScoreControls = () => {
  const {
    liveScoreSettings,
    updateEventLiveStatus,
    releaseResults,
    getEventStatus,
    markEventAsLegacy,
    resetEvent,
  } = useLiveScore()

  const query = queryBuilder(MODELS.events, QUERIES.resultsQuery)
  const { isLoading, data, refetch } = useFetch(query)

  const [buttonStates, setButtonStates] = useState({})

  const handleStartLiveScoring = async (eventId) => {
    setButtonStates((prev) => ({ ...prev, [eventId]: "starting" }))

    try {
      updateEventLiveStatus(eventId, true)

      setTimeout(() => {
        setButtonStates((prev) => ({ ...prev, [eventId]: null }))
      }, 500)
    } catch (error) {
      console.error("❌ Error starting live scoring:", error)
      setButtonStates((prev) => ({ ...prev, [eventId]: "error" }))
    }
  }

  const handleStopLiveScoring = async (eventId) => {
    setButtonStates((prev) => ({ ...prev, [eventId]: "stopping" }))

    try {
      updateEventLiveStatus(eventId, false)
      setTimeout(() => {
        setButtonStates((prev) => ({ ...prev, [eventId]: null }))
      }, 500)
    } catch (error) {
      console.error("❌ Error stopping live scoring:", error)
      setButtonStates((prev) => ({ ...prev, [eventId]: "error" }))
    }
  }

  const handleReleaseResults = async (eventId) => {
    const confirmed = window.confirm(
      "Are you sure you want to release the results? This will make them publicly visible and end live scoring."
    )
    if (!confirmed) {
      return
    }

    setButtonStates((prev) => ({ ...prev, [eventId]: "releasing" }))

    try {
      releaseResults(eventId)
      setTimeout(() => {
        setButtonStates((prev) => ({ ...prev, [eventId]: null }))
      }, 500)
    } catch (error) {
      console.error("❌ Error releasing results:", error)
      setButtonStates((prev) => ({ ...prev, [eventId]: "error" }))
    }
  }

  const handleMarkAsLegacy = (eventId) => {
    if (
      window.confirm(
        "Mark this event as legacy? It will be published and hidden from live controls."
      )
    ) {
      markEventAsLegacy(eventId)
    }
  }

  const handleResetEvent = (eventId) => {
    if (
      window.confirm(
        "Reset this event? This will remove all live score settings for this event."
      )
    ) {
      resetEvent(eventId)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()

    const eventDate = date.toDateString()
    const todayDate = today.toDateString()

    if (eventDate === todayDate)
      return `🔥 TODAY (${date.toLocaleDateString()})`

    const diffTime = date - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return `Tomorrow (${date.toLocaleDateString()})`
    if (diffDays > 0)
      return `In ${diffDays} days (${date.toLocaleDateString()})`
    if (diffDays === -1) return `Yesterday (${date.toLocaleDateString()})`
    if (diffDays < 0)
      return `${Math.abs(diffDays)} days ago (${date.toLocaleDateString()})`

    return date.toLocaleDateString()
  }

  // Show recent events (last 30 days + all future events + any with live settings)
  const relevantEvents =
    data?.data
      ?.filter((event) => {
        const eventDate = new Date(event.eventDate)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const isRecent = eventDate >= thirtyDaysAgo
        const hasLiveSettings = liveScoreSettings[event.id.toString()]

        return isRecent || hasLiveSettings
      })
      .sort((a, b) => {
        const dateA = new Date(a.eventDate)
        const dateB = new Date(b.eventDate)
        const today = new Date()

        // Today's events first
        const isAToday = dateA.toDateString() === today.toDateString()
        const isBToday = dateB.toDateString() === today.toDateString()
        if (isAToday && !isBToday) return -1
        if (!isAToday && isBToday) return 1

        // Then future events
        const isAFuture = dateA > today
        const isBFuture = dateB > today
        if (isAFuture && !isBFuture) return -1
        if (!isAFuture && isBFuture) return 1

        // Then by date (newest first)
        return dateB - dateA
      }) || []

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-[#214A27] mb-6 flex items-center">
          <Eye className="w-6 h-6 mr-2" />
          Live Score Controls
        </h3>
        <div className="p-4">Loading events...</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-[#214A27] flex items-center">
          <Eye className="w-6 h-6 mr-2" />
          Live Score Controls
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={refetch}
            className="bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700 transition-colors flex items-center">
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </button>
        </div>
      </div>

      {/* Status Summary */}
      <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
        <p className="text-sm text-green-800">
          <strong>Manual Live Score System:</strong> {relevantEvents.length}{" "}
          events available •{" "}
          {
            relevantEvents.filter(
              (e) => getEventStatus(e.id.toString(), e.eventDate).isLive
            ).length
          }{" "}
          currently live
        </p>
      </div>

      {/* Instructions */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Manual Control:</strong> Click &quot;Start Live&quot; to begin
          live scoring for an event. Use &quot;Stop Live&quot; to pause scoring
          or &quot;Release Results&quot; to publish final results.
        </p>
      </div>

      <div className="space-y-3">
        {relevantEvents.length > 0 ? (
          relevantEvents.map((event) => {
            const eventStatus = getEventStatus(
              event.id.toString(),
              event.eventDate
            )
            const eventDate = new Date(event.eventDate)
            const now = new Date()
            const isToday = eventDate.toDateString() === now.toDateString()
            const isFuture = eventDate > now
            const hasScores = event.scores && event.scores.length > 0
            const buttonState = buttonStates[event.id.toString()]

            return (
              <div
                key={event.id}
                className={`border rounded-lg p-4 transition-all ${
                  isToday
                    ? "border-blue-400 bg-blue-50 shadow-md"
                    : isFuture
                    ? "border-green-300 bg-green-50"
                    : eventStatus.isLive
                    ? "border-red-400 bg-red-50 shadow-md"
                    : "border-gray-200 hover:shadow-sm"
                }`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {event.golf_club?.clubName || "Unnamed Event"}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {event.eventType} • {formatDate(event.eventDate)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      ID: {event.id} •
                      {hasScores
                        ? ` 📊 ${event.scores.length} scores`
                        : " ⚠️ No scores"}
                      {eventStatus.isLive && <span> • 🔴 LIVE</span>}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Status indicator */}
                    <div className="flex items-center">
                      <div
                        className={`w-3 h-3 rounded-full mr-2 ${
                          eventStatus.resultsReleased
                            ? "bg-green-500"
                            : eventStatus.isLive
                            ? "bg-red-500 animate-pulse"
                            : "bg-yellow-500"
                        }`}></div>
                      <span className="text-xs font-medium">
                        {eventStatus.resultsReleased
                          ? "Released"
                          : eventStatus.isLive
                          ? "LIVE"
                          : "Ready"}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex space-x-2">
                      {!eventStatus.resultsReleased && (
                        <>
                          {!eventStatus.isLive ? (
                            <button
                              onClick={() =>
                                handleStartLiveScoring(event.id.toString())
                              }
                              disabled={buttonState === "starting"}
                              className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors flex items-center disabled:opacity-50">
                              {buttonState === "starting" ? (
                                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                              ) : (
                                <Play className="w-3 h-3 mr-1" />
                              )}
                              Start Live
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                handleStopLiveScoring(event.id.toString())
                              }
                              disabled={buttonState === "stopping"}
                              className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors flex items-center disabled:opacity-50">
                              {buttonState === "stopping" ? (
                                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                              ) : (
                                <Square className="w-3 h-3 mr-1" />
                              )}
                              Stop Live
                            </button>
                          )}

                          <button
                            onClick={() =>
                              handleReleaseResults(event.id.toString())
                            }
                            disabled={buttonState === "releasing"}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50">
                            {buttonState === "releasing" ? (
                              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                            ) : (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            )}
                            Release Results
                          </button>
                        </>
                      )}

                      {buttonState === "error" && (
                        <span className="text-xs text-red-600 px-2 py-1 bg-red-50 rounded">
                          Error!
                        </span>
                      )}

                      {eventStatus.resultsReleased && (
                        <span className="text-xs text-green-600 px-2 py-1 bg-green-50 rounded">
                          ✅ Published
                        </span>
                      )}

                      {/* Advanced options */}
                      <div className="relative group">
                        <button className="text-gray-400 hover:text-gray-600 p-1">
                          <Settings className="w-3 h-3" />
                        </button>
                        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg hidden group-hover:block z-10 whitespace-nowrap">
                          <button
                            onClick={() =>
                              handleResetEvent(event.id.toString())
                            }
                            className="block px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 w-full text-left">
                            Reset Event
                          </button>
                          <button
                            onClick={() =>
                              handleMarkAsLegacy(event.id.toString())
                            }
                            className="block px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 w-full text-left">
                            Mark as Legacy
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Debug info */}
                <div className="text-xs text-gray-400 border-t border-gray-200 pt-2 mt-2">
                  Status: Live={eventStatus.isLive ? "✅" : "❌"} | Released=
                  {eventStatus.resultsReleased ? "✅" : "❌"} | Legacy=
                  {eventStatus.isLegacyEvent ? "✅" : "❌"}
                  {eventStatus.lastUpdated &&
                    ` | Updated: ${new Date(
                      eventStatus.lastUpdated
                    ).toLocaleTimeString()}`}
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No recent events found</p>
            <p className="text-sm mt-2">
              Events from the last 30 days will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default LiveScoreControls
