import { useState, useEffect } from "react"
import PageHeader from "../components/pageHeader"
import TeeTimesTable from "../components/teeTimes/teeTime"
import ListView from "../components/teeTimes/teeTimeListView"
import { queryBuilder } from "../utils/queryBuilder"
import { MODELS, QUERIES } from "../constants/api"
import useFetch from "../utils/hooks/useFetch"
import { getNextEventDate } from "../utils/getNextEventDate"
import { TeeTimesPageSkeleton } from "../components/skeletons"
import { forceRefresh } from "../utils/api/cacheService"
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

const TeeTimesPage = () => {
  const [isListView, setIsListView] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Force refresh on initial load
  useEffect(() => {
    const apiPatterns = ["/teeTimes", "/events"]
    apiPatterns.forEach((pattern) => {
      forceRefresh(pattern)
    })
  }, [])

  // Include refreshKey in the query key to force refetch when it changes
  const query = queryBuilder(MODELS.teeTimes, QUERIES.teeTimesQuery)
  const { isLoading, isError, data, error, refetch } = useFetch(
    query + (query.includes("?") ? "&" : "?") + `refresh=${refreshKey}`,
    { forceRefresh: true }
  )

  // Handle manual refresh by triggering a refetch
  const handleRefresh = () => {
    const apiPatterns = ["/teeTimes", "/events"]
    apiPatterns.forEach((pattern) => {
      forceRefresh(pattern)
    })
    setRefreshKey((prev) => prev + 1) // Update the key to force a new fetch
    refetch() // Explicitly call refetch from React Query
  }

  if (isLoading) {
    return <TeeTimesPageSkeleton isListView={isListView} />
  }

  if (isError) {
    console.error("Error:", error)
    return (
      <div className="error-message flex flex-col items-center justify-center py-8">
        <p className="text-xl mb-4">Something went wrong loading the data.</p>
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

  // Check if we have valid data
  if (!data?.data) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <p className="text-lg">No data available. Please try refreshing.</p>
        <button
          onClick={handleRefresh}
          className="bg-[#214A27] text-white px-4 py-2 rounded mt-4 flex items-center">
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
          Refresh Data
        </button>
      </div>
    )
  }

  const nextEventDate = getNextEventDate(data)
  const nextEvent = nextEventDate
    ? data.data.find((entry) => entry.event?.eventDate === nextEventDate)
    : null

  const eventDate = nextEvent?.event?.eventDate
    ? formatDateWithOrdinal(nextEvent.event.eventDate)
    : "Upcoming Event"

  const isPastEvent = nextEvent?.event?.eventDate
    ? new Date(nextEvent.event.eventDate) < new Date()
    : false

  const filteredTeeTimes = nextEvent?.golfers || []

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
                <h4 className="club-name">
                  {nextEvent.event?.golf_club?.clubName}
                </h4>
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
          <p className="no-events-message">No upcoming events found.</p>
        )}
      </div>
      <div className="tee-times-container">
        <div className="tee-times-wrapper">
          <div className="tee-times-content">
            {!!filteredTeeTimes.length && (
              <>
                {isListView ? (
                  <ListView
                    teeTimes={filteredTeeTimes}
                    isPastEvent={isPastEvent}
                  />
                ) : (
                  <TeeTimesTable
                    teeTimes={filteredTeeTimes}
                    isPastEvent={isPastEvent}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default TeeTimesPage
