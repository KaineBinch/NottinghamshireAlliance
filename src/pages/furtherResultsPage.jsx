import { useState } from "react"
import { useParams } from "react-router-dom"
import { Trophy, Users, User } from "lucide-react"
import { MODELS, QUERIES } from "../constants/api"
import useFetch from "../utils/hooks/useFetch"
import { queryBuilder } from "../utils/queryBuilder"
import "./FurtherResultsPage.css"

const ExpandableText = ({ text }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const toggleExpand = () => setIsExpanded(!isExpanded)

  const fullText = text || "No event review available."

  return (
    <div className="expandable-text-container">
      <div className="expandable-text-wrapper">
        <p
          className={`expandable-text ${
            isExpanded
              ? "expandable-text-expanded"
              : "expandable-text-collapsed"
          }`}>
          {fullText}
        </p>{" "}
        {fullText !== "No event review available." && (
          <button onClick={toggleExpand} className="expand-button">
            {isExpanded ? "Read Less" : "Read More"}
          </button>
        )}
      </div>
    </div>
  )
}

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

const ResultTable = ({ headers, data }) => (
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
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

const formatDate = (dateString) => {
  if (!dateString) return "Date not available"
  const date = new Date(dateString)
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
}

const FurtherResultsPage = () => {
  const [activeTab, setActiveTab] = useState("winners")
  const { eventId } = useParams()
  const query = queryBuilder(MODELS.events, QUERIES.resultsQuery)
  const { isLoading, isError, data, error } = useFetch(query)

  const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"]
    const v = n % 100
    return s[(v - 20) % 10] || s[v] || s[0]
  }

  if (isLoading) {
    return <p className="loading-container">Loading results...</p>
  } else if (isError) {
    console.error("Error:", error)
    return <p className="error-container">Something went wrong...</p>
  }

  const events = data?.data || []

  const event = eventId
    ? events.find((e) => e.id.toString() === eventId.toString())
    : null

  console.log("Event ID from URL:", eventId)
  console.log(
    "Available event IDs:",
    events.map((e) => e.id)
  )
  console.log("Found event:", event?.id, event?.golf_club?.clubName)

  if (!event) {
    return (
      <div className="page-container">
        <div className="not-found-container">
          <h1 className="not-found-title">Results Not Available</h1>
          <p className="not-found-message">
            We don&apos;t have any results for this event yet.
          </p>
          <p className="not-found-secondary">
            Please check back later once the event has concluded and results
            have been posted.
          </p>
        </div>
      </div>
    )
  }

  // Debug the selected event
  console.log("Selected Event:", event)

  const sortedScores = event.scores
    ? [...event.scores].sort((a, b) => b.golferEventScore - a.golferEventScore)
    : []

  const scoresByClub = {}
  event.scores?.forEach((score) => {
    const clubName =
      score.golfer?.golf_club?.clubName ||
      (score.golfer && score.golfer.club_name) ||
      "Unaffiliated"

    if (!scoresByClub[clubName]) {
      scoresByClub[clubName] = []
    }
    scoresByClub[clubName].push(score)
  })

  const teamResults = Object.entries(scoresByClub)
    .map(([clubName, scores]) => {
      const topScores = scores
        .sort((a, b) => b.golferEventScore - a.golferEventScore)
        .slice(0, 4)
      const totalPoints = topScores.reduce(
        (sum, score) => sum + score.golferEventScore,
        0
      )
      return { clubName, totalPoints, scores: topScores }
    })
    .sort((a, b) => b.totalPoints - a.totalPoints)

  const professionalScores =
    event.scores?.filter((score) => score.golfer?.isPro === true) || []
  const sortedProfessionalScores = [...professionalScores].sort(
    (a, b) => b.golferEventScore - a.golferEventScore
  )

  const WinnersTab = () => {
    const topAmateurs = sortedScores
      .filter((score) => !score.golfer?.isPro)
      .slice(0, 3)

    if (topAmateurs.length === 0) {
      return <p>No amateur results available</p>
    }

    return (
      <ResultTable
        headers={["Position", "Name", "Club", "Points"]}
        data={topAmateurs.map((score, index) => [
          `${index + 1}${getOrdinal(index + 1)}`,
          score.golfer?.golferName || "Unknown",
          score.golfer?.golf_club?.clubName || "Unaffiliated",
          score.golferEventScore.toString(),
        ])}
      />
    )
  }

  const TeamsTab = () => {
    if (teamResults.length === 0) {
      return <p>No team results available</p>
    }

    return (
      <div>
        {teamResults.slice(0, 2).map((team, teamIndex) => (
          <div key={team.clubName}>
            <h2 className="team-title">
              {`${teamIndex + 1}${getOrdinal(teamIndex + 1)}: ${
                team.clubName
              } (${team.totalPoints} Points)`}
            </h2>
            <ResultTable
              headers={["Name", "Points"]}
              data={team.scores.map((score) => [
                score.golfer?.golferName || "Unknown",
                score.golferEventScore.toString(),
              ])}
            />
            {teamIndex < 2 && teamResults.length > 1 && (
              <div className="team-divider"></div>
            )}
          </div>
        ))}
      </div>
    )
  }

  const ProfessionalsTab = () => {
    if (sortedProfessionalScores.length === 0) {
      return <p>No professional results available</p>
    }

    return (
      <ResultTable
        headers={["Place", "Name", "Club", "Points"]}
        data={sortedProfessionalScores
          .slice(0, 5)
          .map((score, index) => [
            `${index + 1}${getOrdinal(index + 1)}`,
            score.golfer?.golferName || "Unknown",
            score.golfer?.golf_club?.clubName || "Unaffiliated",
            score.golferEventScore.toString(),
          ])}
      />
    )
  }

  const tabs = [
    {
      id: "winners",
      label: "Amateur",
      icon: Trophy,
      component: WinnersTab,
    },
    { id: "clubs", label: "Team", icon: Users, component: TeamsTab },
    {
      id: "professionals",
      label: "Professionals",
      icon: User,
      component: ProfessionalsTab,
    },
  ]

  return (
    <div className="page-container">
      <div className="content-card">
        <header className="event-header">
          <h1 className="event-title">
            {event.golf_club?.clubName || "Golf Event"}
          </h1>
          <p className="event-type">{event.eventType || "Competition"}</p>
          <p className="event-date">Date: {formatDate(event.eventDate)}</p>
        </header>
        <ExpandableText text={event.eventReview} />
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
