import ResultsCard from "../components/resultsCard"
import PageHeader from "../components/pageHeader"
import { clubs } from "../constants/golfClubs.js"
import { Link } from "react-router-dom"

const isDateInPast = (dateString) => {
  const [day, month, year] = dateString.split("/").map(Number)
  const competitionDate = new Date(`${year}-${month}-${day}`)
  return competitionDate < new Date()
}

const ResultsPage = () => {
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
          {clubs
            .filter((club) => isDateInPast(club.date))
            .map((club, i) => (
              <Link
                to={`/results/${club.name}`}
                key={i}
                className="hover:opacity-80 transition">
                <ResultsCard
                  name={club.name}
                  courseImage={club.courseImage}
                  comp={club.comp}
                  date={club.date}
                />
              </Link>
            ))}
        </div>
      </div>
    </>
  )
}

export default ResultsPage
