import { useState, useMemo, useEffect } from "react"
import { queryBuilder } from "../../utils/queryBuilder"
import { MODELS, QUERIES } from "../../constants/api"
import useFetch from "../../utils/hooks/useFetch"
import { getNextEventDate } from "../../utils/getNextEventDate"

const ListView = () => {
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

  const clubNameLookup = useMemo(() => {
    if (!data?.data) return {}

    return data.data.reduce((acc, item) => {
      item.golfers.forEach((golfer) => {
        if (golfer.golf_club) {
          acc[
            golfer.golf_club.clubID
          ] = `${golfer.golf_club.clubName} Golf Club`
        }
      })
      return acc
    }, {})
  }, [data])

  const groupedByClub = useMemo(() => {
    const grouped = teeTimesData.reduce((acc, teeTime) => {
      teeTime.golfers?.forEach((player) => {
        const club = player?.golf_club?.clubID || "No Club"
        if (!acc[club]) acc[club] = []
        acc[club].push({
          name: player?.golferName || "Unnamed Player",
          time: teeTime.golferTeeTime || "00:00",
        })
      })
      return acc
    }, {})

    const sortedGrouped = Object.entries(grouped)
      .sort(([clubA], [clubB]) => {
        const nameA = clubNameLookup[clubA]?.toLowerCase() || ""
        const nameB = clubNameLookup[clubB]?.toLowerCase() || ""
        return nameA.localeCompare(nameB)
      })
      .reduce((acc, [club, players]) => {
        acc[club] = players
        return acc
      }, {})

    Object.keys(sortedGrouped).forEach((club) => {
      sortedGrouped[club] = sortedGrouped[club].sort((a, b) =>
        a.name.localeCompare(b.name)
      )
    })

    return sortedGrouped
  }, [teeTimesData, clubNameLookup])
  const formatTime = (time) => {
    if (!time || !time.includes(":")) return "Invalid Time"
    const [hours, minutes] = time.split(":")
    return `${hours}:${minutes}`
  }

  if (isLoading) {
    return <p className="pt-[85px]"></p>
  }

  if (isError) {
    console.error("Error:", error)
    return <p className="pt-[85px]">Something went wrong...</p>
  }

  return (
    <div className="w-full flex justify-center">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl w-full">
        {Object.entries(groupedByClub).map(([clubID, players], index) => (
          <div
            key={index}
            className="border border-gray-400 shadow-md bg-[#d9d9d9]">
            <div className="bg-[#214A27] text-white text-center p-4 ">
              <h3 className="text-xl font-semibold">
                {clubNameLookup[clubID] || clubID}
              </h3>
            </div>
            <div className="p-4">
              <ul>
                {players.map((player, playerIndex) => (
                  <li
                    key={playerIndex}
                    className="mb-2 text-gray-700 font-semibold">
                    {player.name} -{" "}
                    <span className="font-medium">
                      {formatTime(player.time)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ListView
