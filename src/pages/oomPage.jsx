// Example of how to update OrderOfMeritPage.jsx
import PageHeader from "../components/pageHeader"
import { results } from "../constants/results"
import { transformResults } from "../utils/transformResults"
import ResultsTable from "../components/results/resultsTable/resultsTable"
import { OOMPageSkeleton } from "../components/skeletons"
import { useState, useEffect } from "react"
import "./oomPage.css"

const OrderOfMeritPage = () => {
  const [loading, setLoading] = useState(true)
  const { rows, columns } = transformResults(results)

  useEffect(() => {
    // Simulate data loading or wait for API calls to complete
    const timer = setTimeout(() => {
      setLoading(false)
    }, 800) // Adjust as needed

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <OOMPageSkeleton />
  }

  return (
    <>
      <PageHeader title="Order of Merit" />
      <hr className="page-divider" />
      <div className="content-background">
        <div className="content-container">
          <p>
            Welcome to the Order of Merit leaderboard. Here, you{"'"}ll find the
            latest rankings showcasing the top performers.
          </p>
          <p className="description-text">
            Stay updated with our leaderboard to track progress and plan your
            next steps.
          </p>
        </div>
        <hr className="page-divider" />
      </div>

      <div className="results-container">
        <ResultsTable columns={columns} rows={rows} />
      </div>
    </>
  )
}

export default OrderOfMeritPage
