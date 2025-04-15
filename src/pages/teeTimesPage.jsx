import { useState, useEffect, useCallback } from "react"
import PageHeader from "../components/pageHeader"
import TeeTimesTable from "../components/teeTimes/teeTime"
import ListView from "../components/teeTimes/teeTimeListView"
import { queryBuilder } from "../utils/queryBuilder"
import { MODELS, QUERIES } from "../constants/api"
import { TeeTimesPageSkeleton } from "../components/skeletons"
import { clearCache } from "../utils/api/cacheService"
import axios from "axios"
import "./teeTimesPage.css"

const getOrdinalSuffix = (day) => {
  if (day > 3 && day < 21) return "th"
  switch (day % 10) {
    case 1:
      return "st"
    case 2:
      return "nd"
    case 3:
      return "rd"
    default:
      return "th"
  }
}

const formatDateWithOrdinal = (dateString) => {
  if (!dateString) {
    console.warn("No date string provided for formatting.")
    return "Invalid Date"
  }

  const date = new Date(dateString)
  const day = date.getDate()
  const ordinal = getOrdinalSuffix(day)

  const formattedDate = date
    .toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .replace(`${day}`, `${day}${ordinal}`)

  return formattedDate
}

// Helper to find today's event and the next upcoming event
const findRelevantEvents = (teeTimes) => {
  if (!teeTimes || !Array.isArray(teeTimes) || teeTimes.length === 0) {
    return { todayEvent: null, nextEvent: null }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0) // Set to beginning of day for proper comparison

  // Group tee times by event date
  const eventsByDate = {}
  teeTimes.forEach((teeTime) => {
    if (teeTime.event?.eventDate) {
      const dateStr = teeTime.event.eventDate
      if (!eventsByDate[dateStr]) {
        eventsByDate[dateStr] = []
      }
      eventsByDate[dateStr].push(teeTime)
    }
  })

  // Convert to array of [dateStr, teeTimes] pairs and sort by date
  const sortedEvents = Object.entries(eventsByDate)
    .map(([dateStr, times]) => ({
      dateStr,
      date: new Date(dateStr),
      teeTimes: times,
      event: times[0].event,
    }))
    .sort((a, b) => a.date - b.date)

  // Find today's event
  const todayEvent = sortedEvents.find((entry) => {
    const eventDate = new Date(entry.dateStr)
    eventDate.setHours(0, 0, 0, 0)
    return eventDate.getTime() === today.getTime()
  })

  // Find the next upcoming event
  const nextEvent = sortedEvents.find((entry) => {
    const eventDate = new Date(entry.dateStr)
    eventDate.setHours(0, 0, 0, 0)
    return eventDate > today
  })

  return {
    todayEvent: todayEvent || null,
    nextEvent: nextEvent || null,
  }
}

const TeeTimesPage = () => {
  const [isListView, setIsListView] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentEvent, setCurrentEvent] = useState(null)
  const [currentEventTeeTimes, setCurrentEventTeeTimes] = useState([])
  const [nextEvent, setNextEvent] = useState(null)

  // Direct fetch function that bypasses all caching
  const fetchDirectFromStrapi = useCallback(async () => {
    setIsLoading(true)
    try {
      // Clear any existing cache
      clearCache()

      // Build the query with a timestamp to bypass any caching
      const query = queryBuilder(MODELS.teeTimes, QUERIES.teeTimesQuery)
      const url = `${query}${query.includes("?") ? "&" : "?"}t=${Date.now()}`

      // Make a direct axios call that bypasses React Query
      const response = await axios.get(url)

      if (response.data && response.data.data) {
        // Process the data
        const allTeeTimeData = response.data.data

        // Find today's event and next event
        const { todayEvent, nextEvent } = findRelevantEvents(allTeeTimeData)

        if (todayEvent) {
          setCurrentEvent(todayEvent.event)
          setCurrentEventTeeTimes(todayEvent.teeTimes)

          if (nextEvent) {
            setNextEvent(nextEvent.event)
          } else {
            setNextEvent(null)
          }
        } else if (nextEvent) {
          // If no today's event but we have a next event, show that
          setCurrentEvent(nextEvent.event)
          setCurrentEventTeeTimes(nextEvent.teeTimes)
          setNextEvent(null)
        } else {
          // No today or future events
          setCurrentEvent(null)
          setCurrentEventTeeTimes([])
          setNextEvent(null)
        }
      } else {
        console.error("Received invalid data format:", response.data)
        setError("Received invalid data format from server")
      }
    } catch (err) {
      console.error("Error fetching tee times:", err)
      setError(err.message || "Failed to fetch tee times")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial load and periodic refresh
  useEffect(() => {
    fetchDirectFromStrapi()

    // Set up periodic refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      fetchDirectFromStrapi()
    }, 30000)

    return () => clearInterval(refreshInterval)
  }, [fetchDirectFromStrapi])

  if (isLoading) {
    return <TeeTimesPageSkeleton isListView={isListView} />
  }

  if (error) {
    return (
      <div className="error-message flex flex-col items-center justify-center py-8">
        <p className="text-xl mb-4">Something went wrong loading the data.</p>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-[#214A27] text-white px-4 py-2 rounded flex items-center">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Reload Page
        </button>
      </div>
    )
  }

  const eventDate = currentEvent?.eventDate
    ? formatDateWithOrdinal(currentEvent.eventDate)
    : "Upcoming Event"

  const isTodayEvent = currentEvent?.eventDate
    ? new Date(currentEvent.eventDate).setHours(0, 0, 0, 0) ===
      new Date().setHours(0, 0, 0, 0)
    : false

  const isPastEvent = currentEvent?.eventDate
    ? new Date(currentEvent.eventDate) < new Date()
    : false

  const handleToggleView = () => {
    setIsListView(!isListView)
  }

  const renderNextEventNotice = () => {
    if (!nextEvent || !nextEvent.eventDate) return null

    const nextEventDate = formatDateWithOrdinal(nextEvent.eventDate)
    return (
      <div className="next-event-notice mt-6 p-4 bg-gray-100 rounded-lg text-center">
        <h5 className="font-semibold text-lg">Next Event</h5>
        <p>{nextEvent.golf_club?.clubName}</p>
        <p>{nextEventDate}</p>
        <p className="mt-2 text-gray-600">
          Tee times are not yet available for this event.
        </p>
      </div>
    )
  }

  return (
    <>
      <PageHeader title="Order of Play" />
      <hr className="header-divider" />
      <div className="page-background">
        <div className="page-content-container">
          <p>
            Please provide any changes or details regarding &#39;unnamed&#39;
            players by 17:00 on the Monday before the event, at the latest.
          </p>
          <p className="info-paragraph">
            Please collect your scorecard at least 10 minutes before your
            scheduled tee time.
          </p>
          <p>
            The entry fee will be payable if you fail to arrive without prior
            notification.
          </p>
        </div>
        <hr className="header-divider" />
      </div>
      <div className="page-content">
        {currentEvent ? (
          <>
            <div className="justify-center items-center">
              <div>
                <h4 className="club-name">
                  {currentEvent?.golf_club?.clubName}
                </h4>
                <h4 className="event-date">{eventDate}</h4>
                {isPastEvent && !isTodayEvent && (
                  <p className="past-event-indicator">Past event</p>
                )}
              </div>
            </div>
            <div className="view-toggle-container">
              <button onClick={handleToggleView} className="view-toggle-button">
                {isListView ? "Tee Time View" : "Club View"}
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <p className="no-events-message">No upcoming events found.</p>
          </div>
        )}
      </div>
      <div className="tee-times-container">
        <div className="tee-times-wrapper">
          <div className="tee-times-content">
            {currentEventTeeTimes.length > 0 ? (
              <>
                {isListView ? (
                  <ListView
                    teeTimes={currentEventTeeTimes}
                    isPastEvent={isPastEvent && !isTodayEvent}
                  />
                ) : (
                  <TeeTimesTable
                    teeTimes={currentEventTeeTimes}
                    isPastEvent={isPastEvent && !isTodayEvent}
                  />
                )}
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-lg">
                  No tee times available for the current event.
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Check back soon for updates.
                </p>
              </div>
            )}

            {/* Show notice about next event */}
            {nextEvent && renderNextEventNotice()}
          </div>
        </div>
      </div>
    </>
  )
}

export default TeeTimesPage
