import { useState } from "react"
import { useParams } from "react-router-dom"
import { Trophy, Users, User } from "lucide-react"
import { MODELS, QUERIES } from "../constants/api"
import useFetch from "../utils/hooks/useFetch"
import { queryBuilder } from "../utils/queryBuilder"

const ExpandableText = ({ text }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const toggleExpand = () => setIsExpanded(!isExpanded)

  // Use provided text or fallback to default
  const fullText = text || "No event review available."

  return (
    <div className="px-5 my-[25px] text-start flex flex-col">
      <div className="relative">
        <p
          className={`${
            isExpanded ? "line-clamp-none" : "line-clamp-4"
          } overflow-clip`}>
          {fullText}
        </p>{" "}
        {fullText !== "No event review available." && (
          <button
            onClick={toggleExpand}
            className="font-bold text-[#214A27] mt-1 inline-block">
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
    className={`md:px-4 py-2 font-semibold text-sm md:text-lg ${
      activeTab === id
        ? "text-[#214A27] border-b-2 border-[#214A27]"
        : "text-gray-700 hover:text-[#214A27]"
    } flex items-center mx-3`}>
    <Icon className="mr-2" size={20} />
    {label}
  </button>
)

const ResultTable = ({ headers, data }) => (
  <div className="overflow-x-auto text-sm md:text-lg">
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-[#214A27] text-white">
          {headers.map((header, index) => (
            <th key={index} className="border p-2 text-center ">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr
            key={rowIndex}
            className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
            {row.map((cell, cellIndex) => (
              <td key={cellIndex} className="border p-2">
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
  const { eventId } = useParams() // Get eventId from URL if using React Router

  const query = queryBuilder(MODELS.events, QUERIES.resultsQuery)
  const { isLoading, isError, data, error } = useFetch(query)

  // Helper function to get ordinal suffix
  const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"]
    const v = n % 100
    return s[(v - 20) % 10] || s[v] || s[0]
  }

  if (isLoading) {
    return <p className="text-center pt-[85px] text-xl">Loading results...</p>
  } else if (isError) {
    console.error("Error:", error)
    return (
      <p className="text-center pt-[85px] text-xl">Something went wrong...</p>
    )
  }

  // Handle the array of events - either use a specific one based on ID or use the first one
  const events = data.data || []
  const event = eventId
    ? events.find((e) => e.id.toString() === eventId)
    : events[1] || events[0] // Default to second event in array or first if only one exists

  console.log("event", event)
  if (!event) {
    return <p className="text-center pt-[85px] text-xl">Event not found</p>
  }

  // Sort scores by golferEventScore in descending order if scores exist
  const sortedScores = event.scores
    ? [...event.scores].sort((a, b) => b.golferEventScore - a.golferEventScore)
    : []

  // Group scores by club for team results
  const scoresByClub = {}
  event.scores?.forEach((score) => {
    // Handle null checks for nested properties
    const clubName =
      score.golfer?.golf_club?.clubName ||
      (score.golfer && score.golfer.club_name) ||
      "Unaffiliated"

    if (!scoresByClub[clubName]) {
      scoresByClub[clubName] = []
    }
    scoresByClub[clubName].push(score)
  })

  // Calculate team totals
  const teamResults = Object.entries(scoresByClub)
    .map(([clubName, scores]) => {
      // Take top 4 scores for each club
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

  // Filter professional scores
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
            <h2 className="text-xl text-start font-semibold my-4">
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
              <div className="h-6"></div>
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
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-[85px] pb-[25px]">
      <div className="bg-white shadow-md rounded-lg p-6 pb-[25px]">
        <header className="mb-[25px]">
          <h1 className="text-3xl font-bold mt-[20px]">
            {event.golf_club?.clubName || "Golf Event"}
          </h1>
          <p className="text-xl my-[10px]">
            {event.eventType || "Competition"}
          </p>
          <p className="pb-[10px]">Date: {formatDate(event.eventDate)}</p>
        </header>
        <ExpandableText text={event.eventReview} />
        <nav className="mb-[50px] flex justify-center">
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
