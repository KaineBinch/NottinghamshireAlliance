import { useState, useEffect } from "react"
import TableHeader from "../components/resultsTable/tableHeader"
import TableRow from "../components/resultsTable/tableRow"

const EventScoresTable = ({ eventName, results }) => {
  const [eventScores, setEventScores] = useState([])

  useEffect(() => {
    const filteredScores = results
      .filter((result) => result.event === eventName)
      .map((result) => ({
        name: result.name,
        score: parseInt(result.score, 10),
        club: result.club,
        result: result.result,
      }))

    const sortedScores = filteredScores.sort((a, b) => b.score - a.score)
    setEventScores(sortedScores)
  }, [eventName, results])

  return (
    <div className="flex flex-col justify-center my-8">
      <h2 className="font-semibold text-lg p-2">Scores for {eventName}</h2>
      <div className="bg-white shadow-md w-full max-w-5xl">
        <TableHeader onCategoryChange={() => {}} category="Event" />
        {eventScores.map((row, rowIndex) => (
          <TableRow
            key={rowIndex}
            row={row}
            rowIndex={rowIndex}
            handleRowClick={() => {}}
            expandedRow={null}
            isClubView={false}
          />
        ))}
      </div>
    </div>
  )
}

export default EventScoresTable
