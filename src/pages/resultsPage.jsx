// Example of how to update ResultsPage.jsx
import { useState, useEffect } from "react"
import ResultsCard from "../components/results/resultsCard"
import PageHeader from "../components/pageHeader"
import { Link } from "react-router-dom"
import { BASE_URL, MODELS, QUERIES } from "../constants/api"
import useFetch from "../utils/hooks/useFetch"
import { queryBuilder } from "../utils/queryBuilder"
import { ResultsPageSkeleton } from "../components/skeletons"
import "./resultsPage.css"

const formatDate = (dateString) => {
  if (!dateString) return null
  const date = new Date(dateString)
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
}

const ResultsPage = () => {
  const [showContent, setShowContent] = useState(false)

  const query = queryBuilder(MODELS.events, QUERIES.resultsQuery)
  const { isLoading, isError, data, error } = useFetch(query)

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
    console.error("Error:", error)
    return <p className="error-container">Something went wrong...</p>
  }

  const validEvents = data?.data
    ? data.data.filter((event) => {
        const eventDate = new Date(event.eventDate)
        const today = new Date()
        const isPastEvent = eventDate < today

        const hasScores = event.scores && event.scores.length > 0

        return (isPastEvent && hasScores) || hasScores
      })
    : []

  return (
    <>
      <PageHeader title="Results" />
      <hr className="page-divider" />
      <div className="content-background">
        <div className="content-container">
          <p>
            Check out the latest results below, highlighting top performers in
            both the individual and club categories.
          </p>
        </div>
        <hr className="page-divider" />
      </div>

      <div className="results-wrapper">
        <div className="results-grid">
          {showContent && validEvents.length > 0 ? (
            validEvents.map((event) => (
              <Link
                to={`/results/${event.id}`}
                key={event.id}
                className="results-card-link">
                <ResultsCard
                  name={event.golf_club?.clubName || "Event"}
                  courseImage={
                    event.golf_club?.clubImage?.[0]?.url
                      ? `${BASE_URL}${event.golf_club.clubImage[0].url}`
                      : "default-image.jpg"
                  }
                  comp={event.eventType || "Competition"}
                  date={formatDate(event.eventDate) || "Date TBD"}
                />
              </Link>
            ))
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
