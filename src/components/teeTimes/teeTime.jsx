import { useState, useMemo, useCallback, useEffect } from "react"
import { queryBuilder } from "../../utils/queryBuilder"
import { MODELS, QUERIES } from "../../constants/api"
import useFetch from "../../utils/hooks/useFetch"
import SearchFilter from "../SearchFilter"
import { getNextEventDate } from "../../utils/getNextEventDate"
import "./teeTime.css"

const TeeTimesTable = () => {
  const [filteredTeeTimes, setFilteredTeeTimes] = useState([])
  const [teeTimesData, setTeeTimesData] = useState([])

  const query = queryBuilder(MODELS.teeTimes, QUERIES.teeTimesQuery)
  const { isLoading, isError, data, error } = useFetch(query)

  const nextEventDate = getNextEventDate(data)

  useEffect(() => {
    if (data?.data) {
      const filtered = data.data.filter(
        (teeTime) => teeTime?.event?.eventDate == nextEventDate
      )
      setTeeTimesData(Array.isArray(filtered) ? filtered : [])
    }
  }, [data, nextEventDate])

  const uniqueClubs = useMemo(() => {
    return [
      ...new Set(
        teeTimesData
          .flatMap((teeTime) =>
            teeTime.golfers?.map(
              (golfer) => golfer?.golf_club?.clubName || "No Club"
            )
          )
          .filter(Boolean)
      ),
    ].sort()
  }, [teeTimesData])

  const searchFilterData = useMemo(
    () =>
      teeTimesData.map((teeTime) => ({
        ...teeTime,
        name: teeTime.golfers
          ?.map((golfer) => golfer?.golferName || "Unnamed Player")
          .join(", "),
        club: teeTime.golfers
          ?.map((golfer) => golfer?.golf_club?.clubName || "No Club")
          .join(", "),
      })),
    [teeTimesData]
  )

  const handleFilteredDataChange = useCallback((filteredData) => {
    setFilteredTeeTimes(filteredData)
  }, [])

  const sortedTeeTimes = useMemo(() => {
    const sortByTime = (a, b) => {
      const [aHours, aMinutes] = a.golferTeeTime.split(":").map(Number)
      const [bHours, bMinutes] = b.golferTeeTime.split(":").map(Number)

      if (aHours === bHours) {
        return aMinutes - bMinutes
      }
      return aHours - bHours
    }

    return [
      ...(filteredTeeTimes.length ? filteredTeeTimes : teeTimesData),
    ].sort(sortByTime)
  }, [filteredTeeTimes, teeTimesData])

  if (isLoading) {
    return <p className="loading-container"></p>
  }
  if (isError) {
    console.error("Error:", error)
    return <p className="error-message">Something went wrong...</p>
  }

  const formatTime = (time) => {
    if (!time) return null
    const [hours, minutes] = time.split(":")
    return `${hours}:${minutes}`
  }

  const displayData = sortedTeeTimes.length >= 0 ? sortedTeeTimes : teeTimesData

  const GolferInfo = ({ player }) => (
    <div className="golfer-info-container">
      {/* Golfer name on first line */}
      <p className="golfer-name">{player?.golferName || "Unnamed Player"}</p>

      {/* Club name on second line */}
      <p className="golfer-club">{player?.golf_club?.clubName || "No Club"}</p>

      {/* Status indicators on third line if applicable */}
      {(player?.isSenior || player?.isPro) && (
        <div className="golfer-status">
          {player?.isSenior && (
            <span className="player-senior-tag">Senior</span>
          )}
          {player?.isPro && (
            <span className="player-pro-tag">Professional</span>
          )}
        </div>
      )}
    </div>
  )

  return (
    <div className="teetimes-container">
      {/* Search Filter */}
      <div className="search-filter-container">
        <SearchFilter
          data={searchFilterData}
          onFilteredDataChange={handleFilteredDataChange}
          uniqueClubs={uniqueClubs}
          className="rounded-none"
        />
      </div>

      {/* Tee Times List */}
      {displayData.length === 0 ? (
        <div className="no-results-container">
          <p className="no-results-heading">No results found</p>
          <p className="no-results-message">Please check the name and try</p>
        </div>
      ) : (
        <div className="teetimes-grid">
          {displayData.map((teeTime, index) => (
            <div key={index} className="teetime-card">
              <div className="teetime-header">
                <h2 className="teetime-time">
                  {formatTime(teeTime.golferTeeTime) || "No Time Available"}
                </h2>
              </div>
              <div className="teetime-body">
                <div className="players-grid">
                  {teeTime.golfers?.map((player, playerIndex) => (
                    <div key={playerIndex} className="player-container">
                      <GolferInfo player={player} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TeeTimesTable
