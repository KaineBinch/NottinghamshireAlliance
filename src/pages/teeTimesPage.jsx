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

// Helper to find the next event date
const getNextEventDate = (teeTimes) => {
  if (!teeTimes || !Array.isArray(teeTimes) || teeTimes.length === 0) {
    return null
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0) // Set to beginning of day for proper comparison

  // First look for future events
  const upcomingEvents = teeTimes.filter((entry) => {
    if (!entry.event?.eventDate) return false
    const eventDate = new Date(entry.event.eventDate)
    eventDate.setHours(0, 0, 0, 0)
    return eventDate >= today
  })

  if (upcomingEvents.length > 0) {
    // Sort ascending (nearest future date first)
    const sortedUpcoming = upcomingEvents.sort(
      (a, b) => new Date(a.event.eventDate) - new Date(b.event.eventDate)
    )
    return sortedUpcoming[0].event.eventDate
  }

  // If no future events, get the most recent past event
  const pastEvents = teeTimes.filter((entry) => {
    if (!entry.event?.eventDate) return false
    const eventDate = new Date(entry.event.eventDate)
    eventDate.setHours(0, 0, 0, 0)
    return eventDate < today
  })

  if (pastEvents.length > 0) {
    // Sort descending (most recent past date first)
    const sortedPast = pastEvents.sort(
      (a, b) => new Date(b.event.eventDate) - new Date(a.event.eventDate)
    )
    return sortedPast[0].event.eventDate
  }

  return null
}

const TeeTimesPage = () => {
  const [isListView, setIsListView] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [nextEvent, setNextEvent] = useState(null)
  const [nextEventTeeTimes, setNextEventTeeTimes] = useState([])

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

        // Find the next event date
        const eventDate = getNextEventDate(allTeeTimeData)

        // Filter tee times for the next event
        const eventTeeTimes = allTeeTimeData.filter(
          (teeTime) => teeTime.event?.eventDate === eventDate
        )

        // Get the next event details
        const event = eventTeeTimes.length > 0 ? eventTeeTimes[0].event : null

        setNextEvent(event)
        setNextEventTeeTimes(eventTeeTimes)
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

  // Manual refresh handler if needed
  const handleRefresh = () => {
    fetchDirectFromStrapi()
  }

  if (isLoading) {
    return <TeeTimesPageSkeleton isListView={isListView} />
  }

  if (error) {
    return (
      <div className="error-message flex flex-col items-center justify-center py-8">
        <p className="text-xl mb-4">Something went wrong loading the data.</p>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={handleRefresh}
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
          Try Again
        </button>
      </div>
    )
  }

  const eventDate = nextEvent?.eventDate
    ? formatDateWithOrdinal(nextEvent.eventDate)
    : "Upcoming Event"

  const isPastEvent = nextEvent?.eventDate
    ? new Date(nextEvent.eventDate) < new Date()
    : false

  const handleToggleView = () => {
    setIsListView(!isListView)
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
        {nextEvent ? (
          <>
            <div className="justify-center items-center">
              <div>
                <h4 className="club-name">{nextEvent?.golf_club?.clubName}</h4>
                <h4 className="event-date">{eventDate}</h4>
                {isPastEvent && (
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
            {nextEventTeeTimes.length > 0 ? (
              <>
                {isListView ? (
                  <ListView
                    teeTimes={nextEventTeeTimes}
                    isPastEvent={isPastEvent}
                  />
                ) : (
                  <TeeTimesTable
                    teeTimes={nextEventTeeTimes}
                    isPastEvent={isPastEvent}
                  />
                )}
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-lg">
                  No tee times available for this event.
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Check back soon for updates.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default TeeTimesPage
