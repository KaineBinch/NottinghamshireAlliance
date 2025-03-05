import { useState, useMemo, useCallback, useEffect } from "react"
import { queryBuilder } from "../../utils/queryBuilder"
import { MODELS, QUERIES } from "../../constants/api"
import useFetch from "../../utils/hooks/useFetch"
import SearchFilter from "../SearchFilter"
import { getNextEventDate } from "../../utils/getNextEventDate"

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
    return <p className="pt-[85px]">Loading...</p>
  }
  if (isError) {
    console.error("Error:", error)
    return <p className="pt-[85px]">Something went wrong...</p>
  }

  const formatTime = (time) => {
    if (!time) return null
    const [hours, minutes] = time.split(":")
    return `${hours}:${minutes}`
  }

  const displayData = sortedTeeTimes.length >= 0 ? sortedTeeTimes : teeTimesData

  return (
    <div className="w-full">
      {/* Search Filter */}
      <div className="mb-4">
        <SearchFilter
          data={searchFilterData}
          onFilteredDataChange={handleFilteredDataChange}
          uniqueClubs={uniqueClubs}
          className="rounded-none"
        />
      </div>

      {/* Tee Times List */}
      {displayData.length === 0 ? (
        <div>
          <p className="font-bold text-xl">No results found</p>
          <p className="text-lg">Please check the name and try</p>
        </div>
      ) : (
        <div className="grid l:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4 w-full drop-shadow-sm">
          {displayData.map((teeTime, index) => (
            <div
              key={index}
              className="col-span-1 border border-gray-400 bg-[#D9D9D9] drop-shadow">
              <div className="p-2 border-b border-gray-300 text-white bg-[#214A27]">
                <h2 className="text-lg font-semibold">
                  {formatTime(teeTime.golferTeeTime) || "No Time Available"}
                </h2>
              </div>
              <div className="p-1">
                <div className="grid md:grid-cols-2 grid-cols-1">
                  {teeTime.golfers?.map((player, playerIndex) => (
                    <div key={playerIndex} className="p-2">
                      <p>
                        <span>{player?.golferName || "Unnamed Player"}</span>
                        <span className="ml-2 text-sm text-gray-500">
                          {player?.golf_club?.clubName || "No Club"}
                        </span>
                      </p>
                      {player?.isSenior && (
                        <p className="text-sm text-red-500">Senior</p>
                      )}
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
