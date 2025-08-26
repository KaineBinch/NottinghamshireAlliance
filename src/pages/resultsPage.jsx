import { useState, useEffect } from "react"
import ResultsCard from "../components/results/resultsCard"
import PageHeader from "../components/pageHeader"
import { Link } from "react-router-dom"
import { BASE_URL, MODELS } from "../constants/api"
import useFetch from "../utils/hooks/useFetch"
import { queryBuilder } from "../utils/queryBuilder"
import { ResultsPageSkeleton } from "../components/skeletons"
import "./resultsPage.css"
import { useLiveScore } from "../constants/LiveScoreContext"

const formatDate = (dateString) => {
  if (!dateString) return null
  const date = new Date(dateString)
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
}

const ResultsPage = () => {
  const [showContent, setShowContent] = useState(false)
  const { getEventStatus } = useLiveScore()

  const query = queryBuilder(
    MODELS.events,
    "?sort[0]=eventDate:desc&populate=scores.golfer.golf_club&populate=golf_club&populate=golf_club.clubImage"
  )
  const { isLoading, isError, data } = useFetch(query)

  useEffect(() => {
    if (!isLoading && data) {
      const timer = setTimeout(() => setShowContent(true), 100)
      return () => clearTimeout(timer)
    }
  }, [isLoading, data])

  if (isLoading) {
    return <ResultsPageSkeleton />
  }

  if (isError) {
    return <p className="error-container">Something went wrong...</p>
  }

  const validEvents = data?.data
    ? data.data
        .filter((event) => {
          const eventDate = new Date(event.eventDate)
          const today = new Date()

          const eventDateNormalized = new Date(eventDate)
          eventDateNormalized.setHours(0, 0, 0, 0)

          const todayNormalized = new Date(today)
          todayNormalized.setHours(0, 0, 0, 0)

          const hasScores = event.scores && event.scores.length > 0

          const twoDaysAgo = new Date(today)
          twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
          const isOlderThan2Days = eventDate < twoDaysAgo

          const isFuture = eventDate > today

          const eventStatus = getEventStatus(
            event.id.toString(),
            event.eventDate
          )

          if (eventStatus.isLive) {
            return true
          }

          if (isFuture) {
            return false
          }

          if (hasScores) {
            return true
          }

          if (!hasScores && !isOlderThan2Days) {
            return true
          }

          return false
        })
        .sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate))
    : []

  return (
    <>
      <PageHeader title="Results" />
      <hr className="page-divider" />
      <div className="content-background">
        <div className="content-container">
          <p>
            Check out the latest results below, highlighting top performers in
            both the individual and club categories. Results are displayed with
            the most recent tournaments first, so you can easily find the latest
            competition outcomes and see how players performed across our
            participating golf clubs throughout Nottinghamshire.
          </p>
        </div>
        <hr className="page-divider" />
      </div>

      <div className="results-wrapper">
        <div className="results-grid">
          {showContent && validEvents.length > 0 ? (
            validEvents.map((event) => {
              const eventStatus = getEventStatus(
                event.id.toString(),
                event.eventDate
              )
              const isLive = eventStatus.isLive

              const eventDate = new Date(event.eventDate)
              const today = new Date()
              const eventDateNormalized = new Date(eventDate)
              eventDateNormalized.setHours(0, 0, 0, 0)
              const todayNormalized = new Date(today)
              todayNormalized.setHours(0, 0, 0, 0)
              const isToday =
                eventDateNormalized.getTime() === todayNormalized.getTime()

              return (
                <Link
                  to={`/results/${event.id}`}
                  key={event.id}
                  className="results-card-link">
                  <ResultsCard
                    name={
                      event.golf_club?.clubName?.replace("Admirals", "Park") ||
                      "Event"
                    }
                    courseImage={
                      event.golf_club?.clubImage?.[0]?.url
                        ? `${BASE_URL}${event.golf_club.clubImage[0].url}`
                        : "default-image.jpg"
                    }
                    comp={event.eventType || "Competition"}
                    date={formatDate(event.eventDate) || "Date TBD"}
                    isLive={isLive}
                    isToday={isToday}
                  />
                </Link>
              )
            })
          ) : showContent ? (
            <div className="no-results-container">
              <p className="no-results-title">No results available yet</p>
              <p className="no-results-subtitle">
                Check back soon for upcoming event results
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </>
  )
}

export default ResultsPage
