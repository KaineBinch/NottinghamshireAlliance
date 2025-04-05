import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { Trophy, Users, User } from "lucide-react"
import { MODELS, QUERIES } from "../constants/api"
import useFetch from "../utils/hooks/useFetch"
import { queryBuilder } from "../utils/queryBuilder"
import ExpandableText from "../components/expandableText"
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

// AmateurTableButtons component remained the same
const AmateurTableButtons = ({ activeCategory, onCategoryChange }) => {
  return (
    <div className="flex flex-row place-content-evenly items-center h-[50px] text-white bg-[#17331B]">
      <button
        className={`w-1/3 border-r border-gray-400 text-sm md:text-base ${
          activeCategory === "all"
            ? "bg-[#d9d9d9] text-black font-bold h-full border-none"
            : "bg-[#17331B] text-white hover:bg-[#1A4923] active:bg-[#0F2C17] h-full"
        }`}
        onClick={() => onCategoryChange("all")}>
        All Scores
      </button>
      <button
        className={`w-1/3 border-r border-gray-400 text-sm md:text-base ${
          activeCategory === "amateur"
            ? "bg-[#d9d9d9] text-black font-bold h-full border-none"
            : "bg-[#17331B] text-white hover:bg-[#1A4923] active:bg-[#0F2C17] h-full"
        }`}
        onClick={() => onCategoryChange("amateur")}>
        Amateur
      </button>
      <button
        className={`w-1/3 text-sm md:text-base ${
          activeCategory === "senior"
            ? "bg-[#d9d9d9] text-black font-bold h-full border-none"
            : "bg-[#17331B] text-white hover:bg-[#1A4923] active:bg-[#0F2C17] h-full"
        }`}
        onClick={() => onCategoryChange("senior")}>
        Senior
      </button>
    </div>
  )
}

// ResultTable component remained the same
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
  const [amateurSubTab, setAmateurSubTab] = useState("all")
  const { clubName } = useParams()

  const query = queryBuilder(MODELS.events, QUERIES.resultsQuery)
  const { isLoading, data, error } = useFetch(query)

  useEffect(() => {
    console.log("Data loading state:", { isLoading, hasData: !!data, error })

    if (data) {
      const event = data.data?.find((e) => e.id.toString() === clubName)
      console.log("Found event:", {
        eventId: clubName,
        found: !!event,
        eventClubName: event?.golf_club?.clubName || "N/A",
        hasScores: !!event?.scores,
        scoreCount: event?.scores?.length || 0,
      })
    }
  }, [data, isLoading, error, clubName])

  if (isLoading) {
    return <div className="loading-container">Loading results...</div>
  }

  const event = data?.data?.find((e) => e.id.toString() === clubName)

  if (!event) {
    return null
  }

  const getOrdinal = (n) => {
    if (n <= 0) return ""

    const s = ["th", "st", "nd", "rd"]
    const v = n % 100

    if (v >= 11 && v <= 13) {
      return "th"
    }

    const lastDigit = n % 10
    return s[lastDigit] || "th"
  }

  const sortedScores = [...event.scores].sort(
    (a, b) => (b.golferEventScore || 0) - (a.golferEventScore || 0)
  )

  const amateurScores = sortedScores.filter(
    (score) => score.golfer && !score.golfer.isPro
  )

  const scoresByClub = {}
  event.scores.forEach((score) => {
    if (!score.golfer) return

    const clubName = score.golfer?.golf_club?.clubName || "Unaffiliated"
    if (!scoresByClub[clubName]) {
      scoresByClub[clubName] = []
    }
    scoresByClub[clubName].push(score)
  })

  const teamResults = Object.entries(scoresByClub)
    .map(([clubName, scores]) => {
      const topScores = scores
        .sort((a, b) => (b.golferEventScore || 0) - (a.golferEventScore || 0))
        .slice(0, 4)

      const totalPoints = topScores.reduce(
        (sum, score) => sum + (score.golferEventScore || 0),
        0
      )

      return { clubName, totalPoints, scores: topScores }
    })
    .sort((a, b) => b.totalPoints - a.totalPoints)

  const professionalScores = event.scores.filter((score) => score.golfer?.isPro)
  const sortedProfessionalScores = [...professionalScores].sort(
    (a, b) => (b.golferEventScore || 0) - (a.golferEventScore || 0)
  )

  const filteredAmateurScores = amateurScores.filter((score) => {
    if (amateurSubTab === "all") return true
    if (amateurSubTab === "amateur") return !score.golfer?.isSenior
    if (amateurSubTab === "senior") return score.golfer?.isSenior
    return true
  })

  const WinnersTab = () => {
    const topAmateurs = amateurScores.slice(0, 3)

    return (
      <div>
        <h2 className="section-title">Top Amateurs</h2>
        {topAmateurs.length === 0 ? (
          <p className="text-center py-4">No amateur results available</p>
        ) : (
          <ResultTable
            headers={["Position", "Name", "Club", "Points"]}
            data={topAmateurs.map((score, index) => [
              `${index + 1}${getOrdinal(index + 1)}`,
              <>
                {score.golfer?.golferName || "Unknown"}
                {score.golfer?.isSenior && (
                  <span className="golfer-senior-tag">Senior</span>
                )}
              </>,
              score.golfer?.golf_club?.clubName || "Unaffiliated",
              score.golferEventScore?.toString() || "0",
            ])}
          />
        )}

        <div className="section-divider"></div>

        <h2 className="section-title">All Amateur Scores</h2>
        <div className="">
          <AmateurTableButtons
            activeCategory={amateurSubTab}
            onCategoryChange={setAmateurSubTab}
          />
        </div>

        {filteredAmateurScores.length === 0 ? (
          <p className="text-center py-4">
            No scores available for this category
          </p>
        ) : (
          <ResultTable
            headers={["Position", "Name", "Club", "Points"]}
            data={filteredAmateurScores.map((score, index) => [
              `${index + 1}${getOrdinal(index + 1)}`,
              <>
                {score.golfer?.golferName || "Unknown"}
                {score.golfer?.isSenior && (
                  <span className="golfer-senior-tag">Senior</span>
                )}
              </>,
              score.golfer?.golf_club?.clubName || "Unaffiliated",
              score.golferEventScore?.toString() || "0",
            ])}
          />
        )}
      </div>
    )
  }

  const TeamsTab = () => {
    if (teamResults.length === 0) {
      return <p className="text-center py-4">No team results available</p>
    }

    return (
      <div className="w-full">
        <h2 className="section-title">Top Teams</h2>
        <div className="flex flex-col md:flex-row md:justify-between md:gap-4">
          {teamResults.slice(0, 3).map((team, teamIndex) => (
            <div key={team.clubName} className="md:flex-1 mb-6 md:mb-0">
              <h2 className="team-title text-center">
                {`${teamIndex + 1}${getOrdinal(teamIndex + 1)}: ${
                  team.clubName
                }`}
              </h2>
              <p className="text-center mb-3">({team.totalPoints} Points)</p>
              <ResultTable
                headers={["Name", "Points"]}
                data={team.scores.map((score) => [
                  score.golfer?.golferName || "Unknown",
                  score.golferEventScore?.toString() || "0",
                ])}
              />
            </div>
          ))}
        </div>

        <div className="section-divider"></div>

        <h2 className="section-title">All Team Scores</h2>
        <ResultTable
          headers={["Position", "Club", "Total Points"]}
          data={teamResults.map((team, index) => [
            `${index + 1}${getOrdinal(index + 1)}`,
            team.clubName,
            team.totalPoints.toString(),
          ])}
        />
      </div>
    )
  }

  const ProfessionalsTab = () => {
    if (sortedProfessionalScores.length === 0) {
      return (
        <p className="text-center py-4">No professional results available</p>
      )
    }

    const topProfessionals = sortedProfessionalScores.slice(0, 5)

    return (
      <div>
        <h2 className="section-title">Top Professionals</h2>
        <ResultTable
          headers={["Position", "Name", "Club", "Points"]}
          data={topProfessionals.map((score, index) => [
            `${index + 1}${getOrdinal(index + 1)}`,
            <>{score.golfer?.golferName || "Unknown"}</>,
            score.golfer?.golf_club?.clubName || "Unaffiliated",
            score.golferEventScore?.toString() || "0",
          ])}
        />

        <div className="section-divider"></div>

        <h2 className="section-title">All Professional Scores</h2>
        <ResultTable
          headers={["Position", "Name", "Club", "Points"]}
          data={sortedProfessionalScores.map((score, index) => [
            `${index + 1}${getOrdinal(index + 1)}`,
            <>{score.golfer?.golferName || "Unknown"}</>,
            score.golfer?.golf_club?.clubName || "Unaffiliated",
            score.golferEventScore?.toString() || "0",
          ])}
        />
      </div>
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

        {/* Use the new ExpandableText component here */}
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
