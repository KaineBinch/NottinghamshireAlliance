import { useState, useMemo } from "react"
import { useParams } from "react-router-dom"
import { Trophy, Users, User } from "lucide-react"
import { MODELS, QUERIES } from "../constants/api"
import useFetch from "../utils/hooks/useFetch"
import { queryBuilder } from "../utils/queryBuilder"
import ExpandableText from "../components/expandableText"
import SearchFilter from "../components/SearchFilter"
import PrintButton from "../components/printButton"
import "./furtherResultsPage.css"

// TabButton component remained the same
const TabButton = ({ id, label, icon: Icon, activeTab, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`tab-button ${
      activeTab === id ? "tab-button-active" : "tab-button-inactive"
    }`}>
    <Icon className="tab-icon" size={20} />
    {label}
  </button>
)

// A general table component for most results
const ResultsTable = ({ headers, data }) => (
  <div className="results-table-container">
    <table className="results-table">
      <thead>
        <tr className="results-table-header">
          {headers.map((header, index) => (
            <th key={index} className="results-table-header-cell">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr
            key={rowIndex}
            className={
              rowIndex % 2 === 0
                ? "results-table-row-even"
                : "results-table-row-odd"
            }>
            {row.map((cell, cellIndex) => (
              <td key={cellIndex} className="results-table-cell">
                {typeof cell === "object" && cell?.content ? (
                  <div className="flex items-center">
                    <span>{cell.content}</span>
                    {cell.usedTiebreaker && (
                      <span
                        className="text-blue-700 ml-1 text-xs font-medium"
                        title="Back 9: {cell.back9Score}">
                        (B9: {cell.back9Score})
                      </span>
                    )}
                  </div>
                ) : (
                  cell
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

// Specialized table for the top winners section with extracted headers
const TopWinnersTable = ({ data, title }) => (
  <div className="mb-5">
    <h3 className="text-[#214A27] font-bold text-sm mb-1">{title}</h3>
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-[#214A27] text-white">
          {data.headerRow.map((cell, index) => (
            <th key={index} className="border border-gray-300 p-1 text-center">
              {cell}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.rows.map((row, rowIndex) => (
          <tr
            key={rowIndex}
            className={rowIndex % 2 === 0 ? "bg-[#d9d9d9]" : "bg-white"}>
            {row.map((cell, cellIndex) => (
              <td key={cellIndex} className="border border-gray-300 p-1">
                {typeof cell === "object" && cell?.content ? (
                  <div className="flex items-center">
                    <span>{cell.content}</span>
                    {cell.usedTiebreaker && (
                      <span
                        className="text-blue-700 ml-1 text-xs font-medium"
                        title="Back 9: {cell.back9Score}">
                        (B9: {cell.back9Score})
                      </span>
                    )}
                  </div>
                ) : (
                  cell
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

// Team scores table with extracted title and simplified columns
const TeamScoresTable = ({ team, title, position }) => {
  const headerTitle = position
    ? `${position} Team - ${team.clubName} ${team.totalPoints} Points${
        team.usedTiebreaker ? ` (B9: ${team.totalBack9})` : ""
      }`
    : `${title} - ${team.clubName} ${team.totalPoints} Points${
        team.usedTiebreaker ? ` (B9: ${team.totalBack9})` : ""
      }`

  return (
    <div className="mb-5 h-full">
      <h3 className="text-[#214A27] font-bold text-sm mb-1">{headerTitle}</h3>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[#214A27] text-white">
            <th className="border border-gray-300 p-1">Golfer Name</th>
            <th className="border border-gray-300 p-1 text-center">
              Individual points
            </th>
          </tr>
        </thead>
        <tbody>
          {team.scores.map((score, index) => (
            <tr
              key={index}
              className={index % 2 === 0 ? "bg-[#d9d9d9]" : "bg-white"}>
              <td className="border border-gray-300 p-1">
                {score.golfer?.golferName || "Unknown Player"}
              </td>
              <td className="border border-gray-300 p-1 text-center">
                {typeof score.golferEventScore === "number" ? (
                  <div className="flex items-center justify-center">
                    <span>{score.golferEventScore}</span>
                    {score.usedTiebreaker && (
                      <span
                        className="text-blue-700 ml-1 text-xs font-medium"
                        title={`Back 9: ${score.back9Score || 0}`}>
                        (B9: {score.back9Score || 0})
                      </span>
                    )}
                  </div>
                ) : (
                  "N/A"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Individual winner table with extracted title
const IndividualWinnerTable = ({
  player,
  position,
  isNTP = false,
  isSenior = false,
}) => (
  <div className="mb-5">
    <h3 className="text-[#214A27] font-bold text-sm mb-1">
      {isNTP
        ? "NTP"
        : isSenior
        ? "Senior Winner"
        : `${position} Individual (not in Winning Teams)`}
    </h3>
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-[#214A27] text-white">
          <th className="border border-gray-300 p-1">Golfer Name</th>
          <th className="border border-gray-300 p-1">Club</th>
          <th className="border border-gray-300 p-1 text-center">Points</th>
        </tr>
      </thead>
      <tbody>
        <tr className="bg-[#d9d9d9]">
          <td className="-seborder border-gray-300 p-1">
            {player.golfer?.golferName || "Unknown Player"}
          </td>
          <td className="border border-gray-300 p-1">
            {player.golfer?.golf_club?.clubName || "Unknown Club"}
          </td>
          <td className="border border-gray-300 p-1 text-center">
            {typeof player.golferEventScore === "number" ? (
              <div className="flex items-center justify-center">
                <span>{player.golferEventScore}</span>
                {player.usedTiebreaker && (
                  <span
                    className="text-blue-700 ml-1 text-xs font-medium"
                    title={`Back 9: ${player.back9Score || 0}`}>
                    (B9: {player.back9Score || 0})
                  </span>
                )}
              </div>
            ) : (
              player.specialScore || "N/A"
            )}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
)

// Professionals table with extracted title
const ProfessionalsTable = ({ scores }) => {
  // Group professionals by score to handle ties
  const scoreGroups = {}
  scores.forEach((score) => {
    const eventScore = score.golferEventScore || 0
    if (!scoreGroups[eventScore]) {
      scoreGroups[eventScore] = []
    }
    scoreGroups[eventScore].push(score)
  })

  // Sort scores in descending order
  const sortedScores = Object.keys(scoreGroups)
    .map(Number)
    .sort((a, b) => b - a)

  // Build rows with position handling for ties
  let currentPosition = 1
  const proRows = []

  sortedScores.forEach((score) => {
    const playersWithScore = scoreGroups[score]

    // Sort players with the same score by back9 (if applicable)
    playersWithScore.sort((a, b) => (b.back9Score || 0) - (a.back9Score || 0))

    // Add each player to the rows array
    playersWithScore.forEach((player) => {
      proRows.push({
        position: currentPosition,
        player: player,
        club: player.golfer?.golf_club?.clubName || "Unknown Club",
        score: player.golferEventScore || 0,
        back9: player.back9Score || 0,
        usedTiebreaker: player.usedTiebreaker,
      })
    })

    // Move position counter forward based on number of players with this score
    currentPosition += playersWithScore.length
  })

  return (
    <div className="mb-5">
      <h3 className="text-[#214A27] font-bold text-sm mb-1">
        PGA Professionals / Assistants
      </h3>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[#214A27] text-white">
            <th className="border border-gray-300 p-1 text-center">Position</th>
            <th className="border border-gray-300 p-1">Golfer Name</th>
            <th className="border border-gray-300 p-1">Club</th>
            <th className="border border-gray-300 p-1 text-center">Points</th>
          </tr>
        </thead>
        <tbody>
          {proRows.slice(0, 5).map((row, index) => (
            <tr
              key={index}
              className={index % 2 === 0 ? "bg-[#d9d9d9]" : "bg-white"}>
              <td className="border border-gray-300 p-1 text-center">
                {row.position}
              </td>
              <td className="border border-gray-300 p-1">
                {row.player.golfer?.golferName || "Unknown"}
              </td>
              <td className="border border-gray-300 p-1">{row.club}</td>
              <td className="border border-gray-300 p-1 text-center">
                <div className="flex items-center justify-center">
                  <span>{row.score}</span>
                  {row.usedTiebreaker && (
                    <span
                      className="text-blue-700 ml-1 text-xs font-medium"
                      title={`Back 9: ${row.back9}`}>
                      (B9: {row.back9})
                    </span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const formatDate = (dateString) => {
  if (!dateString) return "Date not available"
  const date = new Date(dateString)
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
}

const FurtherResultsPage = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState("amateur")

  // Filter states - must be declared at the top
  const [filteredAmateurData, setFilteredAmateurData] = useState([])
  const [filteredTeamData, setFilteredTeamData] = useState([])

  // Get URL parameter
  const { clubName } = useParams()

  // Fetch data
  const query = queryBuilder(MODELS.events, QUERIES.resultsQuery)
  const { isLoading, data } = useFetch(query)

  // Calculate memoized values based on current data
  const processedData = useMemo(() => {
    if (!data?.data || isLoading) {
      return {
        event: null,
        amateurScores: [],
        professionalScores: [],
        topAmateur: null,
        seniorScores: [],
        topSenior: null,
        sortedTeams: [],
        winningTeam: null,
        secondTeam: null,
        firstIndividual: null,
        secondIndividual: null,
        allAmateurData: { headers: [], rows: [] },
        allTeamData: { headers: [], rows: [] },
        topAmateurData: { headerRow: [], rows: [] },
        uniqueAmateurClubs: [],
        uniqueTeamClubs: [],
      }
    }

    // Find the event for the given clubName
    const event = data?.data?.find((e) => e.id.toString() === clubName)

    if (!event) {
      return {
        event: null,
        amateurScores: [],
        professionalScores: [],
        topAmateur: null,
        seniorScores: [],
        topSenior: null,
        sortedTeams: [],
        winningTeam: null,
        secondTeam: null,
        firstIndividual: null,
        secondIndividual: null,
        allAmateurData: { headers: [], rows: [] },
        allTeamData: { headers: [], rows: [] },
        topAmateurData: { headerRow: [], rows: [] },
        uniqueAmateurClubs: [],
        uniqueTeamClubs: [],
      }
    }

    // Helper function for ordinals
    const getOrdinal = (n) => {
      if (n <= 0) return ""
      const s = ["th", "st", "nd", "rd"]
      const v = n % 100
      if (v >= 11 && v <= 13) return "th"
      const lastDigit = n % 10
      return s[lastDigit] || "th"
    }

    // Find groups of tied scores (players with identical scores)
    const findTiedScores = (scores) => {
      const scoreGroups = {}
      scores.forEach((score) => {
        const eventScore = score.golferEventScore || 0
        if (!scoreGroups[eventScore]) {
          scoreGroups[eventScore] = []
        }
        scoreGroups[eventScore].push(score)
      })
      // Return only the groups with more than one player (actual ties)
      return Object.values(scoreGroups).filter((group) => group.length > 1)
    }

    // Modified to use back9Score for tiebreakers
    const sortScoresWithTiebreaker = (scores) => {
      // First find all tied scores
      const tiedGroups = findTiedScores(scores)
      const tiedScoreValues = new Set(
        tiedGroups.map((group) => group[0].golferEventScore || 0)
      )

      return [...scores].sort((a, b) => {
        // First compare by golferEventScore
        const scoreA = a.golferEventScore || 0
        const scoreB = b.golferEventScore || 0
        const scoreDiff = scoreB - scoreA

        if (scoreDiff !== 0) return scoreDiff

        // If tied and this is a score that appears in our tied groups, use back9 as tiebreaker
        if (tiedScoreValues.has(scoreA)) {
          return (b.back9Score || 0) - (a.back9Score || 0)
        }

        // If not in a tied group, maintain original order
        return 0
      })
    }

    // Apply tiebreaker logic to mark rows where back9 determined position
    const applyTiebreakerFlags = (sortedScores) => {
      // Find all tied scores
      const tiedGroups = findTiedScores(sortedScores)

      // Process each tied group
      tiedGroups.forEach((group) => {
        // Skip if all back9 scores are identical (no tiebreaker needed)
        const uniqueBack9Scores = new Set(
          group.map((score) => score.back9Score || 0)
        )
        if (uniqueBack9Scores.size <= 1) return

        // Sort the group by back9Score
        const sortedGroup = [...group].sort(
          (a, b) => (b.back9Score || 0) - (a.back9Score || 0)
        )

        // Mark players in this group as using tiebreaker
        sortedGroup.forEach((score) => {
          score.usedTiebreaker = true
        })
      })

      return sortedScores
    }

    // Apply sorting with tiebreaker to all score collections
    const sortedScores = applyTiebreakerFlags(
      sortScoresWithTiebreaker(event.scores || [])
    )

    // Filter for amateurs, professionals, and find top performers
    const amateurScores = sortedScores.filter(
      (score) => score.golfer && !score.golfer.isPro
    )

    const topAmateur = amateurScores.length > 0 ? amateurScores[0] : null

    const professionalScores = sortedScores.filter(
      (score) => score.golfer?.isPro
    )

    // Find seniors (amateur with isSenior flag)
    const seniorScores = amateurScores.filter(
      (score) => score.golfer && score.golfer.isSenior
    )

    const topSenior =
      seniorScores.length > 0
        ? [...seniorScores].sort(
            (a, b) => (b.golferEventScore || 0) - (a.golferEventScore || 0)
          )[0]
        : null

    // Group scores by club and identify winning teams
    const clubScores = {}
    amateurScores.forEach((score) => {
      if (!score.golfer?.golf_club) return

      const clubName = score.golfer.golf_club.clubName || "Unaffiliated"
      if (!clubScores[clubName]) {
        clubScores[clubName] = []
      }
      clubScores[clubName].push(score)
    })

    // Calculate team scores
    const teamScores = Object.entries(clubScores).map(([clubName, scores]) => {
      // Sort players in each club by score
      const sortedClubScores = [...scores].sort(
        (a, b) => (b.golferEventScore || 0) - (a.golferEventScore || 0)
      )

      // Take top 4 players (or all if less than 4)
      const topScores = sortedClubScores.slice(0, 4)

      const totalPoints = topScores.reduce(
        (sum, score) => sum + (score.golferEventScore || 0),
        0
      )

      const totalBack9 = topScores.reduce(
        (sum, score) => sum + (score.back9Score || 0),
        0
      )

      return {
        clubName,
        scores: topScores,
        totalPoints,
        totalBack9,
      }
    })

    // Sort teams by total points
    const sortedTeams = [...teamScores].sort((a, b) => {
      const pointsDiff = b.totalPoints - a.totalPoints
      if (pointsDiff !== 0) return pointsDiff
      return b.totalBack9 - a.totalBack9
    })

    // Mark tied teams (same points, different back9)
    const teamPointGroups = {}
    sortedTeams.forEach((team) => {
      if (!teamPointGroups[team.totalPoints]) {
        teamPointGroups[team.totalPoints] = []
      }
      teamPointGroups[team.totalPoints].push(team)
    })

    // Mark teams that require tiebreakers
    Object.values(teamPointGroups)
      .filter((group) => group.length > 1)
      .forEach((group) => {
        const uniqueBack9 = new Set(group.map((team) => team.totalBack9))
        if (uniqueBack9.size <= 1) return // All same back9

        group.forEach((team) => {
          team.usedTiebreaker = true
        })
      })

    // Get the top two teams
    const winningTeam = sortedTeams.length > 0 ? sortedTeams[0] : null
    const secondTeam = sortedTeams.length > 1 ? sortedTeams[1] : null

    // Find individual winners not in winning teams
    const playersInWinningTeams = new Set()

    // Add players from top two teams to the set
    if (winningTeam) {
      winningTeam.scores.forEach((score) => {
        if (score.golfer) playersInWinningTeams.add(score.golfer.golferName)
      })
    }

    if (secondTeam) {
      secondTeam.scores.forEach((score) => {
        if (score.golfer) playersInWinningTeams.add(score.golfer.golferName)
      })
    }

    // Filter amateur scores to find top players not in winning teams
    const individualsNotInTeams = amateurScores.filter(
      (score) =>
        score.golfer && !playersInWinningTeams.has(score.golfer.golferName)
    )

    // Sort by score (with tiebreaker already applied)
    const topIndividualsNotInTeams = individualsNotInTeams.slice(0, 2)
    const firstIndividual =
      topIndividualsNotInTeams.length > 0 ? topIndividualsNotInTeams[0] : null
    const secondIndividual =
      topIndividualsNotInTeams.length > 1 ? topIndividualsNotInTeams[1] : null

    // Top amateur data for display
    const topAmateurData = {
      headerRow: ["Golfer Name", "Club", "Points"],
      rows: topAmateur
        ? [
            [
              topAmateur.golfer?.golferName || "Unknown",
              topAmateur.golfer?.golf_club?.clubName || "Unknown",
              {
                content: topAmateur.golferEventScore || 0,
                usedTiebreaker: topAmateur.usedTiebreaker,
                back9Score: topAmateur.back9Score || 0,
              },
            ],
          ]
        : [["No Amateur Scores", "", ""]],
    }

    // All amateur data for the tabbed section
    const allAmateurData = {
      headers: ["Position", "Golfer Name", "Club", "Points"],
      rows: amateurScores.map((score, index) => [
        `${index + 1}${getOrdinal(index + 1)}`,
        <>
          {score.golfer?.golferName || "Unknown"}
          {score.golfer?.isSenior && (
            <span className="golfer-senior-tag">Senior</span>
          )}
        </>,
        score.golfer?.golf_club?.clubName || "Unaffiliated",
        {
          content: score.golferEventScore?.toString() || "0",
          usedTiebreaker: score.usedTiebreaker,
          back9Score: score.back9Score || 0,
        },
      ]),
    }

    // All team data for the tabbed section
    const allTeamData = {
      headers: ["Position", "Club", "Total Points"],
      rows: sortedTeams.map((team, index) => [
        `${index + 1}${getOrdinal(index + 1)}`,
        team.clubName,
        {
          content: team.totalPoints.toString(),
          usedTiebreaker: team.usedTiebreaker,
          back9Score: team.totalBack9,
        },
      ]),
    }

    // Get unique clubs for amateur filter
    const uniqueAmateurClubs = [
      ...new Set(
        amateurScores.map(
          (score) => score.golfer?.golf_club?.clubName || "No Club"
        )
      ),
    ].sort()

    // Get unique clubs for team filter
    const uniqueTeamClubs = [
      ...new Set(sortedTeams.map((team) => team.clubName || "No Club")),
    ].sort()

    return {
      event,
      amateurScores,
      professionalScores,
      topAmateur,
      seniorScores,
      topSenior,
      sortedTeams,
      winningTeam,
      secondTeam,
      firstIndividual,
      secondIndividual,
      allAmateurData,
      allTeamData,
      topAmateurData,
      uniqueAmateurClubs,
      uniqueTeamClubs,
    }
  }, [data, clubName, isLoading])

  // Update filtered data when raw data changes
  useMemo(() => {
    if (processedData.allAmateurData?.rows) {
      setFilteredAmateurData(processedData.allAmateurData.rows)
    }
    if (processedData.allTeamData?.rows) {
      setFilteredTeamData(processedData.allTeamData.rows)
    }
  }, [processedData.allAmateurData, processedData.allTeamData])

  if (isLoading) {
    return <div className="loading-container">Loading results...</div>
  }

  if (!processedData.event) {
    return null
  }

  // Define the tabs for the section at the bottom of the page
  const tabs = [
    {
      id: "amateur",
      label: "Amateur",
      icon: Trophy,
      component: () => (
        <>
          <div className="results-search-filter">
            <SearchFilter
              data={processedData.allAmateurData.rows.map((row) => ({
                name:
                  typeof row[1] === "object"
                    ? row[1].props.children[0]
                    : row[1],
                club: row[2],
              }))}
              onFilteredDataChange={(filteredData) => {
                const newFilteredRows =
                  processedData.allAmateurData.rows.filter((row) => {
                    const rowName =
                      typeof row[1] === "object"
                        ? row[1].props.children[0]
                        : row[1]
                    const rowClub = row[2]
                    return filteredData.some(
                      (item) => item.name === rowName && item.club === rowClub
                    )
                  })
                setFilteredAmateurData(newFilteredRows)
              }}
              uniqueClubs={processedData.uniqueAmateurClubs}
            />
          </div>
          <ResultsTable
            headers={processedData.allAmateurData.headers}
            data={filteredAmateurData}
          />
        </>
      ),
    },
    {
      id: "team",
      label: "Team",
      icon: Users,
      component: () => (
        <>
          <div className="results-search-filter">
            <SearchFilter
              data={processedData.allTeamData.rows.map((row) => ({
                name: row[1],
                club: row[1], // For teams, name and club are the same
              }))}
              onFilteredDataChange={(filteredData) => {
                const newFilteredRows = processedData.allTeamData.rows.filter(
                  (row) => filteredData.some((item) => item.name === row[1])
                )
                setFilteredTeamData(newFilteredRows)
              }}
              uniqueClubs={processedData.uniqueTeamClubs}
            />
          </div>
          <ResultsTable
            headers={processedData.allTeamData.headers}
            data={filteredTeamData}
          />
        </>
      ),
    },
    {
      id: "professional",
      label: "Professional",
      icon: User,
      component: () => (
        <ResultsTable
          headers={["Position", "Golfer Name", "Club", "Points"]}
          data={processedData.professionalScores.map((score, index) => [
            `${index + 1}${getOrdinal(index + 1)}`,
            score.golfer?.golferName || "Unknown",
            score.golfer?.golf_club?.clubName || "Unaffiliated",
            {
              content: score.golferEventScore?.toString() || "0",
              usedTiebreaker: score.usedTiebreaker,
              back9Score: score.back9Score || 0,
            },
          ])}
        />
      ),
    },
  ]

  // Get the ordinal suffix for numbers (defined at render time to avoid hook issues)
  const getOrdinal = (n) => {
    if (n <= 0) return ""
    const s = ["th", "st", "nd", "rd"]
    const v = n % 100
    if (v >= 11 && v <= 13) return "th"
    const lastDigit = n % 10
    return s[lastDigit] || "th"
  }

  const {
    event,
    topAmateurData,
    professionalScores,
    winningTeam,
    secondTeam,
    firstIndividual,
    secondIndividual,
    topSenior,
  } = processedData

  return (
    <div className="page-container">
      <div className="content-card">
        {/* Original header style */}
        <header className="event-header">
          <h1 className="event-title">
            {event.golf_club?.clubName || "Golf Event"}
          </h1>
          <p className="event-type">{event.eventType || "Competition"}</p>
          <p className="event-date">Date: {formatDate(event.eventDate)}</p>
        </header>

        {/* Optional review text with ExpandableText component */}
        {event.eventReview && <ExpandableText text={event.eventReview} />}

        {/* Divider between review and results tables */}
        <div className="border-b border-gray-300 my-5"></div>

        <div id="results-sections" className="results-sections">
          {/* TOP AMATEUR - First section */}
          <TopWinnersTable data={topAmateurData} title="Amateur Winner" />

          {/* PROFESSIONALS - Second section */}
          {professionalScores.length > 0 && (
            <ProfessionalsTable scores={professionalScores} />
          )}

          {/* TEAMS - Third section, side by side */}
          <div className="flex flex-col md:flex-row md:gap-3">
            {/* Winning Team */}
            <div className="md:flex-1">
              {winningTeam && (
                <TeamScoresTable team={winningTeam} title="Winning Team" />
              )}
            </div>

            {/* 2nd Team */}
            <div className="md:flex-1">
              {secondTeam && (
                <TeamScoresTable team={secondTeam} position="2nd" />
              )}
            </div>
          </div>

          {/* INDIVIDUALS NOT IN WINNING TEAMS - Fourth section, side by side */}
          <div className="flex flex-col md:flex-row md:gap-3">
            {/* 1st Individual (not in winning teams) */}
            <div className="md:flex-1">
              {firstIndividual && (
                <IndividualWinnerTable
                  player={firstIndividual}
                  position="1st"
                />
              )}
            </div>

            {/* 2nd Individual (not in winning teams) */}
            <div className="md:flex-1">
              {secondIndividual && (
                <IndividualWinnerTable
                  player={secondIndividual}
                  position="2nd"
                />
              )}
            </div>
          </div>

          {/* SENIOR - Fifth section */}
          {topSenior && (
            <IndividualWinnerTable player={topSenior} isSenior={true} />
          )}
        </div>

        {/* Add print button here */}
        <div className="print-button-container">
          <PrintButton contentId="results-sections" />
        </div>

        {/* Divider between results tables and all scores*/}
        <div className="border-b border-gray-300"></div>

        {/* Tabbed section for all scores */}
        <div className="h-1 bg-[#e5e7eb]"></div>

        <h2 className="section-title">All Scores</h2>

        <nav className="tabs-navigation">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              {...tab}
              activeTab={activeTab}
              onClick={setActiveTab}
            />
          ))}
        </nav>

        <main>{tabs.find((tab) => tab.id === activeTab).component()}</main>
      </div>
    </div>
  )
}

export default FurtherResultsPage
