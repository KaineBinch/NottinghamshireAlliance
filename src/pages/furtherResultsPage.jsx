import { useState, useEffect, useMemo } from "react"
import { useParams } from "react-router-dom"
import { Trophy, Users, User } from "lucide-react"
import { MODELS } from "../constants/api"
import useFetch from "../utils/hooks/useFetch"
import { queryBuilder } from "../utils/queryBuilder"
import ExpandableText from "../components/expandableText"
import SearchFilter from "../components/SearchFilter"
import PrintButton from "../components/printButton"
import { useLiveScore } from "../constants/LiveScoreContext"
import { useResultsData } from "../utils/hooks/useResultsData"
import TabButton from "../components/furtherResults/TabButton"
import ResultsTable from "../components/furtherResults/ResultsTable"
import TopWinnersTable from "../components/furtherResults/TopWinnersTable"
import TeamScoresTable from "../components/furtherResults/TeamScoresTable"
import IndividualWinnerTable from "../components/furtherResults/IndividualWinnerTable"
import ProfessionalsTable from "../components/furtherResults/ProfessionalsTable"
import LiveScoreScreen from "../components/liveScore/LiveScoreScreen"
import "./furtherResultsPage.css"

const formatDate = (dateString) => {
  if (!dateString) return "Date not available"
  const date = new Date(dateString)
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
}

const FurtherResultsPage = () => {
  const [activeTab, setActiveTab] = useState("amateur")
  const { eventId } = useParams()
  const [filteredAmateurData, setFilteredAmateurData] = useState([])
  const [filteredTeamData, setFilteredTeamData] = useState([])
  const { getEventStatus } = useLiveScore()
  const query = queryBuilder(
    MODELS.events,
    "?sort[0]=eventDate:desc&populate=scores.golfer.golf_club&populate=golf_club&populate=golf_club.clubImage"
  )
  const { isLoading, data } = useFetch(query)
  const currentEvent = useMemo(() => {
    return data?.data?.find((e) => e.id.toString() === eventId)
  }, [data, eventId])
  const eventStatus = useMemo(() => {
    return getEventStatus(eventId, currentEvent?.eventDate)
  }, [getEventStatus, eventId, currentEvent?.eventDate])
  const processedData = useResultsData(data, eventId, isLoading)
  const shouldBlockAccess = useMemo(() => {
    if (isLoading || !data || !processedData.event) {
      return false
    }
    const event = processedData.event
    const hasScores = event.scores && event.scores.length > 0
    if (!hasScores) {
      return true
    }
    const eventDate = new Date(event.eventDate)
    const today = new Date()
    const eventDateNormalized = new Date(eventDate).setHours(0, 0, 0, 0)
    const todayNormalized = new Date(today).setHours(0, 0, 0, 0)
    const isToday = eventDateNormalized === todayNormalized
    const shouldAllowAccess =
      eventStatus.resultsReleased ||
      eventStatus.isLegacyEvent ||
      !eventStatus.lastUpdated ||
      (isToday && hasScores)
    return !shouldAllowAccess && !eventStatus.isLive
  }, [isLoading, data, processedData.event, eventStatus])

  useEffect(() => {
    if (processedData.allAmateurData?.rows) {
      setFilteredAmateurData(processedData.allAmateurData.rows)
    }
    if (processedData.allTeamData?.rows) {
      setFilteredTeamData(processedData.allTeamData.rows)
    }
  }, [processedData.allAmateurData, processedData.allTeamData])

  if (!isLoading && currentEvent && eventStatus.isLive) {
    return <LiveScoreScreen eventId={eventId} eventData={currentEvent} />
  }

  if (shouldBlockAccess) {
    const event = processedData.event
    const hasScores = event?.scores && event.scores.length > 0

    if (!event) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Event Not Found
            </h2>
            <p className="text-gray-600">
              The requested event could not be found.
            </p>
          </div>
        </div>
      )
    }

    if (!hasScores) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              No Results Available
            </h2>
            <p className="text-gray-600 mb-2">
              This event doesn&apos;t have any scores yet.
            </p>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Results Not Yet Available
          </h2>
          <p className="text-gray-600 mb-2">
            Results for this event will be available once scoring is complete.
          </p>
        </div>
      </div>
    )
  }

  const getOrdinal = (n) => {
    if (n <= 0) return ""
    const s = ["th", "st", "nd", "rd"]
    const v = n % 100
    if (v >= 11 && v <= 13) return "th"
    return s[n % 10] || "th"
  }

  if (isLoading) {
    return <div className="loading-container">Loading results...</div>
  }

  if (!processedData.event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Event Not Found
          </h2>
          <p className="text-gray-600">
            The requested event could not be found.
          </p>
        </div>
      </div>
    )
  }

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
                club: row[1],
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
            <>
              {score.golfer?.golferName || "Unknown"}
              {score.isNIT && <span className="golfer-nit-tag">NIT</span>}
            </>,
            score.golfer?.golf_club?.clubName || "Unaffiliated",
            {
              content: score.golferEventScore.toString(), // Removed null check since we filtered earlier
              usedTiebreaker: score.usedTiebreaker,
              back9Score: score.back9Score || 0,
            },
          ])}
        />
      ),
    },
  ]

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
        <header className="event-header">
          <h1 className="event-title">
            {event.golf_club?.clubName || "Golf Event"}
          </h1>
          <p className="event-type">{event.eventType || "Competition"}</p>
          <p className="event-date">Date: {formatDate(event.eventDate)}</p>
        </header>
        {event.eventReview && <ExpandableText text={event.eventReview} />}
        <div className="print-button-container">
          <PrintButton contentId="results-sections" />
        </div>
        <div className="border-b border-gray-300 my-5"></div>
        <div id="results-sections" className="results-sections">
          <TopWinnersTable data={topAmateurData} title="Amateur Winner" />
          {professionalScores.length > 0 && (
            <ProfessionalsTable scores={professionalScores} />
          )}
          <div className="flex flex-col md:flex-row md:gap-3">
            <div className="md:flex-1">
              {winningTeam && (
                <TeamScoresTable team={winningTeam} title="Winning Team" />
              )}
            </div>
            <div className="md:flex-1">
              {secondTeam && (
                <TeamScoresTable team={secondTeam} position="2nd" />
              )}
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:gap-3">
            <div className="md:flex-1">
              {firstIndividual && (
                <IndividualWinnerTable
                  player={firstIndividual}
                  position="1st"
                />
              )}
            </div>
            <div className="md:flex-1">
              {secondIndividual && (
                <IndividualWinnerTable
                  player={secondIndividual}
                  position="2nd"
                />
              )}
            </div>
          </div>
          {topSenior && (
            <IndividualWinnerTable player={topSenior} isSenior={true} />
          )}
        </div>
        <div className="border-b border-gray-300"></div>
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
