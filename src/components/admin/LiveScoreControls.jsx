import { useState, useEffect } from "react"
import {
  Play,
  CheckCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
} from "lucide-react"
import { useLiveScore } from "../../constants/LiveScoreContext"
import { MODELS, QUERIES } from "../../constants/api"
import useFetch from "../../utils/hooks/useFetch"
import { queryBuilder } from "../../utils/queryBuilder"

const SimplifiedLiveScoreControls = () => {
  const { updateEventLiveStatus, releaseResults, getEventStatus, resetEvent } =
    useLiveScore()

  const query = queryBuilder(MODELS.events, QUERIES.resultsQuery)
  const { isLoading, data } = useFetch(query)

  const [buttonStates, setButtonStates] = useState({})
  const [showPreviousEvents, setShowPreviousEvents] = useState(false)
  const [showMoreUpcoming, setShowMoreUpcoming] = useState(false)

  // Auto-start live scoring for today's events
  useEffect(() => {
    if (data?.data) {
      const today = new Date()
      const todayStr = today.toDateString()

      data.data.forEach((event) => {
        const eventDate = new Date(event.eventDate)
        const isToday = eventDate.toDateString() === todayStr
        const eventStatus = getEventStatus(event.id.toString(), event.eventDate)

        // Auto-start live scoring for today's events that aren't already live or finished
        if (isToday && !eventStatus.isLive && !eventStatus.resultsReleased) {
          console.log(
            `Auto-starting live scoring for today's event: ${event.id}`
          )
          updateEventLiveStatus(event.id.toString(), true)
        }
      })
    }
  }, [data])

  const handleFinishEvent = async (eventId) => {
    const confirmed = window.confirm(
      "Are you sure you want to finish this event? This will end live scoring and publish the results."
    )
    if (!confirmed) return

    setButtonStates((prev) => ({ ...prev, [eventId]: "finishing" }))

    try {
      releaseResults(eventId)
      setTimeout(() => {
        setButtonStates((prev) => ({ ...prev, [eventId]: null }))
      }, 500)
    } catch (error) {
      console.error("❌ Error finishing event:", error)

      setButtonStates((prev) => ({ ...prev, [eventId]: "error" }))
    }
  }

  const handleRestartEvent = async (eventId) => {
    const confirmed = window.confirm(
      "Are you sure you want to restart live scoring for this event?"
    )
    if (!confirmed) return

    setButtonStates((prev) => ({ ...prev, [eventId]: "restarting" }))

    try {
      // Reset the event first, then start it live again
      resetEvent(eventId)
      setTimeout(() => {
        updateEventLiveStatus(eventId, true)
        setButtonStates((prev) => ({ ...prev, [eventId]: null }))
      }, 200)
    } catch (error) {
      console.error("❌ Error restarting event:", error)
      setButtonStates((prev) => ({ ...prev, [eventId]: "error" }))
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()

    const eventDate = date.toDateString()
    const todayDate = today.toDateString()

    if (eventDate === todayDate) return "TODAY"

    const diffTime = date - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "Tomorrow"
    if (diffDays > 0) return `In ${diffDays} days`
    if (diffDays === -1) return "Yesterday"
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`

    return date.toLocaleDateString()
  }

  const getUpcomingEvents = () => {
    if (!data?.data) return []

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return data.data
      .filter((event) => {
        const eventDate = new Date(event.eventDate)
        eventDate.setHours(0, 0, 0, 0)
        const eventStatus = getEventStatus(event.id.toString(), event.eventDate)

        // Include if it's today or future OR if it's currently live (restarted events)
        return eventDate >= today || eventStatus.isLive
      })
      .sort((a, b) => {
        // Sort live events first, then by date
        const statusA = getEventStatus(a.id.toString(), a.eventDate)
        const statusB = getEventStatus(b.id.toString(), b.eventDate)

        if (statusA.isLive && !statusB.isLive) return -1
        if (!statusA.isLive && statusB.isLive) return 1

        return new Date(a.eventDate) - new Date(b.eventDate)
      })
  }

  const getPreviousEvents = () => {
    if (!data?.data) return []

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return data.data
      .filter((event) => {
        const eventDate = new Date(event.eventDate)
        eventDate.setHours(0, 0, 0, 0)
        const eventStatus = getEventStatus(event.id.toString(), event.eventDate)

        // Only include past events that are NOT currently live
        return eventDate < today && !eventStatus.isLive
      })
      .sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate))
      .slice(0, 20) // Show last 20 events
  }

  const upcomingEvents = getUpcomingEvents()
  const primaryUpcomingEvents = upcomingEvents.slice(0, 2)
  const additionalUpcomingEvents = upcomingEvents.slice(2)
  const previousEvents = getPreviousEvents()

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 mr-3 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600">Loading events...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-center items-center mb-6">
        <h2 className="text-lg font-semibold text-center">Live Scoring</h2>
      </div>

      {/* Upcoming Events Section */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Calendar className="w-5 h-5 mr-2 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-900">
            Upcoming Events
          </h3>
        </div>

        {primaryUpcomingEvents.length > 0 ? (
          <div className="space-y-4">
            {primaryUpcomingEvents.map((event) => {
              const eventStatus = getEventStatus(
                event.id.toString(),
                event.eventDate
              )
              const buttonState = buttonStates[event.id.toString()]
              const hasScores = event.scores && event.scores.length > 0

              return (
                <div
                  key={event.id}
                  className={`border-2 rounded-xl p-6 transition-all ${
                    eventStatus.isLive
                      ? "border-red-400 bg-red-50 shadow-lg"
                      : eventStatus.resultsReleased
                      ? "border-green-400 bg-green-50"
                      : "border-blue-400 bg-blue-50"
                  }`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-gray-900 mb-2">
                        {event.golf_club?.clubName || "Unnamed Event"}
                      </h4>
                      <div className="flex items-center text-gray-600 mb-3">
                        <span className="text-lg">{event.eventType}</span>
                        <span className="ml-4 text-sm text-gray-500">
                          {formatDate(event.eventDate)}
                        </span>
                        {hasScores && (
                          <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                            {event.scores.length} players
                          </span>
                        )}
                      </div>

                      {/* Status Display */}
                      <div className="flex items-center">
                        {eventStatus.isLive && (
                          <div className="flex items-center text-red-600 font-semibold">
                            <div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                            <span className="text-lg">LIVE SCORING ACTIVE</span>
                          </div>
                        )}

                        {eventStatus.resultsReleased && (
                          <div className="flex items-center text-green-600 font-semibold">
                            <CheckCircle className="w-5 h-5 mr-2" />
                            <span className="text-lg">EVENT FINISHED</span>
                          </div>
                        )}

                        {!eventStatus.isLive &&
                          !eventStatus.resultsReleased && (
                            <div className="flex items-center text-blue-600 font-semibold">
                              <Clock className="w-5 h-5 mr-2" />
                              <span className="text-lg">READY TO START</span>
                            </div>
                          )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="ml-6">
                      {eventStatus.resultsReleased ? (
                        <button
                          onClick={() =>
                            handleRestartEvent(event.id.toString())
                          }
                          disabled={buttonState === "restarting"}
                          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg text-lg font-semibold transition-colors flex items-center disabled:opacity-50">
                          {buttonState === "restarting" ? (
                            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                          ) : (
                            <Play className="w-5 h-5 mr-2" />
                          )}
                          Restart Live Scoring
                        </button>
                      ) : eventStatus.isLive ? (
                        <button
                          onClick={() => handleFinishEvent(event.id.toString())}
                          disabled={buttonState === "finishing"}
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-lg font-semibold transition-colors flex items-center disabled:opacity-50">
                          {buttonState === "finishing" ? (
                            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="w-5 h-5 mr-2" />
                          )}
                          Finish Event
                        </button>
                      ) : (
                        <div className="text-center text-gray-500 italic text-lg">
                          {formatDate(event.eventDate) === "TODAY"
                            ? "Live scoring will start automatically"
                            : `Scheduled for ${formatDate(event.eventDate)}`}
                        </div>
                      )}

                      {buttonState === "error" && (
                        <div className="mt-2 text-center text-red-600 font-semibold">
                          Error! Please try again
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-xl text-gray-500 font-medium">
              No upcoming events scheduled
            </p>
            <p className="text-gray-400 mt-2">
              Events will appear here when scheduled
            </p>
          </div>
        )}

        {/* See More Upcoming Events */}
        {additionalUpcomingEvents.length > 0 && (
          <div className="mt-6 border-t pt-4">
            <button
              onClick={() => setShowMoreUpcoming(!showMoreUpcoming)}
              className="flex items-center justify-between w-full text-left mb-4 hover:bg-gray-50 p-3 rounded-lg transition-colors">
              <h4 className="text-lg font-medium text-gray-700 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                See More Upcoming Events ({additionalUpcomingEvents.length})
              </h4>
              {showMoreUpcoming ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>

            {showMoreUpcoming && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-3">
                  {additionalUpcomingEvents.map((event) => {
                    const eventStatus = getEventStatus(
                      event.id.toString(),
                      event.eventDate
                    )
                    const buttonState = buttonStates[event.id.toString()]

                    return (
                      <div
                        key={event.id}
                        className="flex justify-between items-center bg-white p-4 rounded-lg border">
                        <div>
                          <h5 className="font-semibold text-gray-900">
                            {event.golf_club?.clubName || "Unnamed Event"}
                          </h5>
                          <p className="text-sm text-gray-600">
                            {event.eventType} • {formatDate(event.eventDate)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {event.scores?.length || 0} players •{" "}
                            {eventStatus.resultsReleased
                              ? "Finished"
                              : eventStatus.isLive
                              ? "Live"
                              : "Scheduled"}
                          </p>
                        </div>

                        {eventStatus.isLive ? (
                          <button
                            onClick={() =>
                              handleFinishEvent(event.id.toString())
                            }
                            disabled={buttonState === "finishing"}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm transition-colors flex items-center disabled:opacity-50">
                            {buttonState === "finishing" ? (
                              <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4 mr-1" />
                            )}
                            Finish
                          </button>
                        ) : eventStatus.resultsReleased ? (
                          <button
                            onClick={() =>
                              handleRestartEvent(event.id.toString())
                            }
                            disabled={buttonState === "restarting"}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded text-sm transition-colors flex items-center disabled:opacity-50">
                            {buttonState === "restarting" ? (
                              <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <Play className="w-4 h-4 mr-1" />
                            )}
                            Restart
                          </button>
                        ) : (
                          <span className="text-xs text-gray-500 px-3 py-2 bg-gray-100 rounded">
                            {formatDate(event.eventDate)}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">How it works:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Live scoring starts automatically on the day of each event</li>
          <li>• Click &quot;Finish Event&quot; when the event is complete</li>
          <li>
            • Use &quot;Restart Live Scoring&quot; if you need to reopen an
            event
          </li>
          <li>• View more upcoming events in the expandable section</li>
          <li>• Previous events can be found in the section below</li>
        </ul>
      </div>

      {/* Previous Events Section */}
      <div className="border-t pt-6">
        <button
          onClick={() => setShowPreviousEvents(!showPreviousEvents)}
          className="flex items-center justify-between w-full text-left mb-4 hover:bg-gray-50 p-3 rounded-lg transition-colors">
          <h3 className="text-lg font-semibold text-gray-700 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Previous Events ({previousEvents.length})
          </h3>
          {showPreviousEvents ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {showPreviousEvents && (
          <div className="bg-gray-50 rounded-lg p-4">
            {previousEvents.length > 0 ? (
              <div className="space-y-3">
                {previousEvents.map((event) => {
                  const eventStatus = getEventStatus(
                    event.id.toString(),
                    event.eventDate
                  )
                  const buttonState = buttonStates[event.id.toString()]

                  return (
                    <div
                      key={event.id}
                      className="flex justify-between items-center bg-white p-4 rounded-lg border">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {event.golf_club?.clubName || "Unnamed Event"}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {event.eventType} •{" "}
                          {new Date(event.eventDate).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {event.scores?.length || 0} players •{" "}
                          {eventStatus.resultsReleased
                            ? "Finished"
                            : "Not finished"}
                        </p>
                      </div>

                      <button
                        onClick={() => handleRestartEvent(event.id.toString())}
                        disabled={buttonState === "restarting"}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors flex items-center disabled:opacity-50">
                        {buttonState === "restarting" ? (
                          <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4 mr-1" />
                        )}
                        Restart
                      </button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                No previous events found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SimplifiedLiveScoreControls