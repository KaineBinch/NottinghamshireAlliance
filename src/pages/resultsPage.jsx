import ResultsCard from "../components/results/resultsCard"
import PageHeader from "../components/pageHeader"
import { Link } from "react-router-dom"
import { BASE_URL, MODELS, QUERIES } from "../constants/api"
import useFetch from "../utils/hooks/useFetch"
import { queryBuilder } from "../utils/queryBuilder"

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

  if (isLoading) {
    return <p className="pt-[85px]">Loading...</p>
  } else if (isError) {
    console.error("Error:", error)
    return <p className="pt-[85px]">Something went wrong...</p>
  }

  return (
    <>
      <PageHeader title="Results" />
      <hr className="border-black" />
      <div className="bg-[#d9d9d9]">
        <div className="max-w-5xl mx-auto py-5 px-4 sm:px-6 lg:px-8 text-start">
          <p>
            Check out the latest results below, highlighting top performers in
            both the individual and club categories.
          </p>
        </div>
        <hr className="border-black" />
      </div>
      <div className="flex flex-col items-center">
        <div className="w-auto max-w-5xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 px-5 py-10">
          {data.data
            .filter((event) => isDateInPast(event.eventDate))
            .map((event) => (
              <Link
                to={`/results/${event.id}`}
                key={event.id}
                className="hover:opacity-80 transition">
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
            ))}
        </div>
      </div>
    </>
  )
}

export default ResultsPage
