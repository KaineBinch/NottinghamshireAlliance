import { useState, useCallback, useEffect, useMemo } from "react"
import { queryBuilder } from "../../../utils/queryBuilder"
import { MODELS, QUERIES } from "../../../constants/api"
import useFetch from "../../../utils/hooks/useFetch"
import TableHeader from "./tableHeader"
import TableRow from "./tableRow"
import SearchFilter from "../../SearchFilter"

const ResultsTable = ({ limit }) => {
  const [expandedRow, setExpandedRow] = useState(null)
  const [category, setCategory] = useState("Amateur")
  const [rankedResults, setRankedResults] = useState([])
  const [filteredResults, setFilteredResults] = useState([])

  const query = queryBuilder(MODELS.scores, QUERIES.oomQuery)

  const { isLoading, isError, data, error } = useFetch(query)

  const results = useMemo(() => {
    if (data?.data) {
      return data.data.map((item) => ({
        name: item.golfer.golferName,
        club: item.golfer.golf_club.clubName,
        golferClubID: item.golfer.golf_club.clubID,
        isPro: item.golfer.isPro,
        isSenior: item.golfer.isSenior,
        eventDate: item.event.eventDate,
        eventType: item.event.eventType,
        result: item.golferEventScore,
        totalPoints: item.golferEventScore,
      }))
    }
    return []
  }, [data?.data])

  const uniqueClubs = useMemo(
    () => [...new Set(results.map((result) => result.club || "No Club"))],
    [results]
  )

  const categorizeData = useCallback(() => {
    let categorizedData = []

    if (category === "Professional") {
      categorizedData = results.filter((row) => row.isPro)
    } else if (category === "Senior") {
      categorizedData = results.filter((row) => row.isSenior)
    } else if (category === "Amateur") {
      categorizedData = results.filter((row) => !row.isPro)
    } else if (category === "Club") {
      const clubMap = results.reduce((acc, row) => {
        const totalPoints = parseInt(row.totalPoints || 0, 10)

        if (acc[row.club]) {
          // Add this player to the club's players array
          acc[row.club].players.push({
            name: row.name,
            score: totalPoints,
            date: row.eventDate,
            result: row.result,
          })

          // Sort players by score in descending order
          acc[row.club].players.sort((a, b) => b.score - a.score)

          // Take top 4 scores for the club total
          const top4Scores = acc[row.club].players.slice(0, 4)
          acc[row.club].totalPoints = top4Scores.reduce(
            (sum, player) => sum + player.score,
            0
          )
        } else {
          acc[row.club] = {
            club: row.club,
            totalPoints: totalPoints,
            players: [
              {
                name: row.name,
                score: totalPoints,
                date: row.eventDate,
                result: row.result,
              },
            ],
          }
        }
        return acc
      }, {})

      categorizedData = Object.values(clubMap).map(
        ({ club, totalPoints, players }) => ({
          name: club,
          totalPoints,
          players, // This will contain all players from the club
          topPlayers: players.slice(0, 4), // Take top 4 players by score
        })
      )
    }

    return categorizedData
  }, [category, results])

  const sortAndRankData = useCallback((data) => {
    const sortedData = data
      .map((row) => ({
        ...row,
        totalPoints: row.totalPoints || 0,
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints)

    const rankedData = sortedData.map((row, index) => ({
      ...row,
      rank: index + 1,
    }))

    return rankedData
  }, [])

  useEffect(() => {
    const categorizedData = categorizeData()
    const rankedData = sortAndRankData(categorizedData)
    setRankedResults(rankedData)
    setFilteredResults(rankedData)
  }, [categorizeData, sortAndRankData])

  const handleFilteredDataChange = (data) => {
    setFilteredResults(data)
  }

  const displayedResults = limit
    ? filteredResults.slice(0, limit)
    : filteredResults

  if (isLoading) {
    return <p className="pt-[85px]">Loading...</p>
  }

  if (isError) {
    console.error("Error:", error)
    return <p className="pt-[85px]">Something went wrong...</p>
  }

  const handleRowClick = (row) => {
    setExpandedRow(expandedRow === row ? null : row)
  }

  return (
    <div className="flex flex-col justify-center my-8">
      <SearchFilter
        data={rankedResults}
        onFilteredDataChange={handleFilteredDataChange}
        uniqueClubs={uniqueClubs}
        className="rounded-none"
      />
      <div className="bg-white shadow-md w-full max-w-5xl border border-gray-400">
        <table className="w-full border-collapse">
          <TableHeader onCategoryChange={setCategory} category={category} />
          <tbody>
            {displayedResults.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                row={row}
                rowIndex={row.rank - 1}
                handleRowClick={() => handleRowClick(row)}
                expandedRow={expandedRow}
                isClubView={category === "Club"}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ResultsTable
