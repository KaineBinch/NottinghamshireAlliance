import { useState, useMemo, useEffect } from "react"
import { queryBuilder } from "../../utils/queryBuilder"
import { MODELS, QUERIES } from "../../constants/api"
import useFetch from "../../utils/hooks/useFetch"
import { getNextEventDate } from "../../utils/getNextEventDate"
import "./teeTimeListView.css"

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
          isSenior: player?.isSenior || false,
          isPro: player?.isPro || false,
        })
      })
      return acc
    }, {})

    const sortedGrouped = Object.entries(grouped)
      .sort(([clubA], [clubB]) => {
        if (clubA === "No Club") return 1
        if (clubB === "No Club") return -1
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
    return <p className="loading-container"></p>
  }

  if (isError) {
    console.error("Error:", error)
    return <p className="error-message">Something went wrong...</p>
  }

  return (
    <div className="list-view-container">
      <div className="list-view-grid">
        {Object.entries(groupedByClub).map(([clubID, players], index) => (
          <div key={index} className="club-card">
            <div className="club-header">
              <h3
                className="club-title"
                title={clubNameLookup[clubID] || clubID}>
                {clubNameLookup[clubID] || clubID}
              </h3>
            </div>
            <div className="players-container">
              <ul>
                {players.map((player, playerIndex) => (
                  <li key={playerIndex} className="player-item">
                    <span className="player-name">{player.name}</span>

                    {player.isSenior && (
                      <span className="player-senior-tag"> Senior</span>
                    )}
                    {player.isPro && (
                      <span className="player-pro-tag"> Professional</span>
                    )}
                    <span className="player-time-separator"> - </span>
                    <span className="player-time">
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
