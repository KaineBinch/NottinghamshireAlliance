import ResultsCard from "../components/results/resultsCard"
import PageHeader from "../components/pageHeader"
import { Link } from "react-router-dom"
import { BASE_URL, MODELS, QUERIES } from "../constants/api"
import useFetch from "../utils/hooks/useFetch"
import { queryBuilder } from "../utils/queryBuilder"
import { useState, useEffect } from "react"
import "./resultsPage.css" // Import the new CSS file

const formatDate = (dateString) => {
  if (!dateString) return null
  const date = new Date(dateString)
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
}

const isDateInPast = (dateString) => {
  if (!dateString) return false
  const date = new Date(dateString)
  return date < new Date()
}

const ResultsPage = () => {
  const query = queryBuilder(MODELS.events, QUERIES.resultsQuery)
  const { isLoading, isError, data, error } = useFetch(query)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    if (!isLoading && data) {
      const timer = setTimeout(() => {
        setShowContent(true)
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [isLoading, data])

  if (isError) {
    console.error("Error:", error)
    return <p className="error-message">Something went wrong...</p>
  }

  const pastEvents =
    data?.data.filter((event) => isDateInPast(event.eventDate)) || []

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
          {showContent && pastEvents.length > 0 ? (
            pastEvents.map((event) => (
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
                  comp={event.eventType}
                  date={formatDate(event.eventDate) || "Date TBD"}
                />
              </Link>
            ))
          ) : showContent && pastEvents.length === 0 ? (
            <div className="no-results-container">
              <p className="no-results-title">No results available yet</p>
              <p className="no-results-subtitle">
                Check back soon for upcoming event results
              </p>
            </div>
          ) : (
            <div className="empty-state"></div>
          )}
        </div>
      </div>
    </>
  )
}

export default ResultsPage
