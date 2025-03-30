import { useState } from "react"
import PageHeader from "../components/pageHeader"
import TeeTimesTable from "../components/teeTimes/teeTime"
import ListView from "../components/teeTimes/teeTimeListView"
import { queryBuilder } from "../utils/queryBuilder"
import { MODELS, QUERIES } from "../constants/api"
import useFetch from "../utils/hooks/useFetch"
import { getNextEventDate } from "../utils/getNextEventDate"
import { TeeTimesPageSkeleton } from "../components/skeletons"
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

  const query = queryBuilder(MODELS.teeTimes, QUERIES.teeTimesQuery)
  const { isLoading, isError, data, error } = useFetch(query)

  if (isLoading) {
    return <TeeTimesPageSkeleton isListView={isListView} />
  } else if (isError) {
    console.error("Error:", error)
    return <p className="error-message">Something went wrong...</p>
  }

  const nextEventDate = getNextEventDate(data)
  const nextEvent = data?.data.find(
    (entry) => entry.event?.eventDate === nextEventDate
  )

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
