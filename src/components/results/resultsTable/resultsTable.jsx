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
      const validItems = data.data.filter(
        (item) =>
          item &&
          item.golfer &&
          item.golfer.golferName &&
          item.event &&
          item.event.eventDate &&
          item.golferEventScore !== null &&
          item.golferEventScore !== undefined
      )

      // Now process only the valid items
      const playerScores = validItems.reduce((acc, item) => {
        const playerName = item.golfer.golferName
        const playerScore = item.golferEventScore
        const clubName = item.golfer.golf_club?.clubName || "No Club"
        const clubID = item.golfer.golf_club?.clubID || null
        const isPro = item.golfer.isPro || false
        const isSenior = item.golfer.isSenior || false
        const eventDate = item.event.eventDate

        if (!acc[playerName]) {
          acc[playerName] = {
            name: playerName,
            club: clubName,
            golferClubID: clubID,
            isPro: isPro,
            isSenior: isSenior,
            totalPoints: 0,
            scores: [],
          }
        }

        acc[playerName].totalPoints += playerScore
        acc[playerName].scores.push({
          date: eventDate,
          score: playerScore,
        })

        return acc
      }, {})

      return Object.values(playerScores)
    }
    return []
  }, [data?.data])

  const uniqueClubs = useMemo(
    () => [...new Set(results.map((result) => result.club || "No Club"))],
    [results]
  )

  const categorizeData = useCallback(() => {
    let categorizedData = results

    if (category === "Professional") {
      categorizedData = results.filter((row) => row.isPro)
    } else if (category === "Senior") {
      categorizedData = results.filter((row) => row.isSenior)
    } else if (category === "Amateur") {
      categorizedData = results.filter((row) => !row.isPro)
    } else if (category === "Club") {
      const clubMap = results.reduce((acc, row) => {
        if (row.club && !acc[row.club]) {
          acc[row.club] = {
            club: row.club,
            totalPoints: 0,
            players: [],
          }
        }
        if (row.club) {
          acc[row.club].players.push({
            name: row.name,
            score: row.totalPoints,
            scores: row.scores,
          })
        }
        return acc
      }, {})

      categorizedData = Object.values(clubMap).map(({ club, players }) => {
        const dateScores = players.reduce((dateAcc, player) => {
          player.scores.forEach(({ date, score }) => {
            if (!dateAcc[date]) {
              dateAcc[date] = []
            }
            dateAcc[date].push(score)
          })
          return dateAcc
        }, {})

        const top4DateScores = {}
        for (const date in dateScores) {
          dateScores[date].sort((a, b) => b - a)
          const top4Scores = dateScores[date].slice(0, 4)
          top4DateScores[date] = top4Scores.reduce(
            (sum, score) => sum + score,
            0
          )
        }

        const clubTotalPoints = Object.values(top4DateScores).reduce(
          (sum, score) => sum + score,
          0
        )

        return {
          name: club,
          totalPoints: clubTotalPoints,
          players,
          topPlayers: players.slice(0, 4),
        }
      })
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
    return <p className="pt-[85px]"></p>
  }

  if (isError) {
    console.error("Error:", error)
    return <p className="pt-[85px]">Something went wrong...</p>
  }

  const handleRowClick = (row) => {
    setExpandedRow(expandedRow === row ? null : row)
  }

  return (
    <div className="flex flex-col justify-center my-8 mb-16">
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
