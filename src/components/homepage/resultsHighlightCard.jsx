import { useState, useEffect } from "react"
import { queryBuilder } from "../../utils/queryBuilder"
import { MODELS, QUERIES } from "../../constants/api"
import useFetch from "../../utils/hooks/useFetch"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faTrophy,
  faMedal,
  faAward,
  faUser,
  faUsers,
  faBriefcase,
} from "@fortawesome/free-solid-svg-icons"

const fontStyles = {
  heading: {
    fontSize: "clamp(1.25rem, 3vw + 0.5rem, 2rem)",
  },
  subheading: {
    fontSize: "clamp(0.8rem, 1.5vw + 0.5rem, 1.1rem)",
  },
  name: {
    fontSize: "clamp(0.875rem, 1.5vw + 0.5rem, 1.125rem)",
  },
  info: {
    fontSize: "clamp(0.75rem, 1vw + 0.5rem, 0.9rem)",
  },
  tab: {
    fontSize: "clamp(0.7rem, 1vw + 0.5rem, 0.9rem)",
  },
  score: {
    fontSize: "clamp(0.875rem, 1.5vw + 0.5rem, 1.1rem)",
  },
  unit: {
    fontSize: "clamp(0.5rem, 0.5vw + 0.4rem, 0.7rem)",
  },
  icon: {
    fontSize: "clamp(0.875rem, 1.5vw + 0.5rem, 1.25rem)",
  },
  message: {
    fontSize: "clamp(0.75rem, 1vw + 0.3rem, 0.875rem)",
  },
}

const ResultsHighlightCard = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [latestEvent, setLatestEvent] = useState(null)
  const [topAmateurs, setTopAmateurs] = useState([])
  const [topPros, setTopPros] = useState([])
  const [topClubs, setTopClubs] = useState([])
  const [activeTab, setActiveTab] = useState("amateurs")

  const query = queryBuilder(MODELS.events, QUERIES.resultsQuery)
  const { isLoading, isError, data } = useFetch(query)

  useEffect(() => {
    if (!isLoading && data?.data && data.data.length > 0) {
      const pastEvents = data.data
        .filter((event) => {
          const eventDate = new Date(event.eventDate)
          const today = new Date()
          return eventDate < today && event.scores && event.scores.length > 0
        })
        .sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate))

      if (pastEvents.length > 0) {
        const latest = pastEvents[0]
        setLatestEvent(latest)

        const amateurs = latest.scores
          .filter((score) => score.golfer && !score.golfer.isPro)
          .sort((a, b) => (b.golferEventScore || 0) - (a.golferEventScore || 0))
          .slice(0, 3)
        setTopAmateurs(amateurs)

        const pros = latest.scores
          .filter((score) => score.golfer && score.golfer.isPro)
          .sort((a, b) => (b.golferEventScore || 0) - (a.golferEventScore || 0))
          .slice(0, 3)
        setTopPros(pros)

        if (latest.scores && latest.scores.length > 0) {
          const scoresByClub = {}
          latest.scores.forEach((score) => {
            if (!score.golfer) return

            const clubName = score.golfer?.golf_club?.clubName || "Unaffiliated"
            if (!scoresByClub[clubName]) {
              scoresByClub[clubName] = []
            }
            scoresByClub[clubName].push(score)
          })

          const clubResults = Object.entries(scoresByClub)
            .map(([clubName, scores]) => {
              const topScores = scores
                .sort(
                  (a, b) =>
                    (b.golferEventScore || 0) - (a.golferEventScore || 0)
                )
                .slice(0, 4)

              const totalPoints = topScores.reduce(
                (sum, score) => sum + (score.golferEventScore || 0),
                0
              )

              return {
                clubName,
                totalPoints,
                scores: topScores,
                memberCount: topScores.length,
              }
            })
            .sort((a, b) => b.totalPoints - a.totalPoints)
            .slice(0, 3)

          setTopClubs(clubResults)
        }

        setTimeout(() => {
          setIsVisible(true)
        }, 100)
      }
    }
  }, [isLoading, data])

  const formatDate = (dateString) => {
    if (!dateString) return "Date not available"
    const date = new Date(dateString)
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
    return date.toLocaleDateString("en-GB", options)
  }

  const getMedalColor = (index) => {
    switch (index) {
      case 0:
        return "text-yellow-500"
      case 1:
        return "text-gray-400"
      case 2:
        return "text-amber-700"
      default:
        return "text-gray-600"
    }
  }

  const getPositionIcon = (index) => {
    switch (index) {
      case 0:
        return (
          <FontAwesomeIcon
            icon={faTrophy}
            className={`${getMedalColor(index)}`}
            style={fontStyles.icon}
          />
        )
      case 1:
        return (
          <FontAwesomeIcon
            icon={faMedal}
            className={`${getMedalColor(index)}`}
            style={fontStyles.icon}
          />
        )
      case 2:
        return (
          <FontAwesomeIcon
            icon={faAward}
            className={`${getMedalColor(index)}`}
            style={fontStyles.icon}
          />
        )
      default:
        return (
          <span className="font-semibold" style={fontStyles.icon}>
            {index + 1}
          </span>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="w-full mx-auto bg-[#D9D9D9] p-6 animate-pulse">
        <div className="h-7 bg-gray-300 w-3/4 mx-auto mb-4 "></div>
        <div className="h-5 bg-gray-300 w-1/2 mx-auto mb-6 "></div>
        <div className="h-12 bg-gray-300 w-full mb-6 "></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start p-3 bg-gray-200 ">
              <div className="w-10 h-10 bg-gray-300  mr-4"></div>
              <div className="flex-1">
                <div className="h-5 bg-gray-300 w-3/4 mb-2 "></div>
                <div className="h-4 bg-gray-300 w-1/2 "></div>
              </div>
              <div className="w-16 h-16 bg-gray-300 ml-4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (isError || !latestEvent) {
    return null
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "amateurs":
        return (
          <>
            {topAmateurs.length > 0 ? (
              <div className="space-y-4">
                {topAmateurs.map((score, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-white shadow-sm p-2 transition-all hover:shadow-md">
                    <div className="flex-shrink-0 w-4 h-12 flex items-center justify-start bg-[#F5F5F5] ml-2">
                      {getPositionIcon(index)}
                    </div>
                    <div className="flex-1 ml-3">
                      <h4
                        className="font-semibold break-words"
                        style={fontStyles.name}>
                        {score.golfer?.golferName}
                      </h4>
                      <p
                        className="text-gray-600 break-words"
                        style={fontStyles.info}>
                        {score.golfer?.golf_club?.clubName || "No Club"}
                        {score.golfer?.isSenior && (
                          <span className="text-red-600 text-xs ml-2">
                            (Senior)
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex-shrink-0 bg-[#214A27] text-white text-center rounded-full md:w-14 md:h-14 w-12 h-12 flex items-center justify-center">
                      <div>
                        <span className="font-bold" style={fontStyles.score}>
                          {score.golferEventScore || 0}
                        </span>
                        <span style={fontStyles.unit} className="ml-0.5">
                          pts
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-white">
                <p className="text-gray-500" style={fontStyles.message}>
                  No amateur results available
                </p>
              </div>
            )}
          </>
        )
      case "professionals":
        return (
          <>
            {topPros.length > 0 ? (
              <div className="space-y-4">
                {topPros.map((score, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-white shadow-sm p-2 transition-all hover:shadow-md">
                    <div className="flex-shrink-0 w-4 h-12 flex items-center justify-start bg-[#F5F5F5] ml-2">
                      {getPositionIcon(index)}
                    </div>
                    <div className="flex-1 min-w-0 ml-3">
                      <h4
                        className="font-semibold break-words"
                        style={fontStyles.name}>
                        {score.golfer?.golferName}
                      </h4>
                      <p
                        className="text-gray-600 break-words"
                        style={fontStyles.info}>
                        {score.golfer?.golf_club?.clubName || "No Club"}
                      </p>
                    </div>
                    <div className="flex-shrink-0 bg-[#214A27] text-white text-center rounded-full md:w-14 md:h-14 w-12 h-12 flex items-center justify-center">
                      <div>
                        <span className="font-bold" style={fontStyles.score}>
                          {score.golferEventScore || 0}
                        </span>
                        <span style={fontStyles.unit} className="ml-0.5">
                          pts
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-white">
                <p className="text-gray-500" style={fontStyles.message}>
                  No professional results available
                </p>
              </div>
            )}
          </>
        )
      case "clubs":
        return (
          <>
            {topClubs.length > 0 ? (
              <div className="space-y-4">
                {topClubs.map((club, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-white shadow-sm p-2 transition-all hover:shadow-md">
                    <div className="flex-shrink-0 w-4 h-12 flex items-center justify-start bg-[#F5F5F5] ml-2">
                      {getPositionIcon(index)}
                    </div>
                    <div className="flex-1 min-w-0 ml-3">
                      <h4
                        className="font-semibold break-words"
                        style={fontStyles.name}>
                        {club.clubName}
                      </h4>
                      <p
                        className="text-gray-600 break-words"
                        style={fontStyles.info}>
                        Top {club.memberCount}{" "}
                        {club.memberCount === 1 ? "player" : "players"}
                      </p>
                    </div>
                    <div className="flex-shrink-0 bg-[#214A27] text-white text-center rounded-full md:w-14 md:h-14 w-12 h-12 flex items-center justify-center">
                      <div>
                        <span className="font-bold" style={fontStyles.score}>
                          {club.totalPoints}
                        </span>
                        <span style={fontStyles.unit} className="ml-0.5">
                          pts
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-white">
                <p className="text-gray-500" style={fontStyles.message}>
                  No club results available
                </p>
              </div>
            )}
          </>
        )
      default:
        return null
    }
  }

  return (
    <div
      className="w-full mx-auto bg-[#D9D9D9] p-6 text-black"
      style={{
        maxWidth: "800px",
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}>
      <h2 style={fontStyles.heading} className="font-bold mb-2 text-center">
        {latestEvent.golf_club?.clubName || "Recent"} Results
      </h2>
      <p
        style={fontStyles.subheading}
        className="mb-6 text-center text-gray-700">
        {formatDate(latestEvent.eventDate)}
      </p>

      {/* Tab Navigation */}
      <div className="flex overflow-hidden mb-6 shadow-sm">
        <button
          onClick={() => setActiveTab("amateurs")}
          className={`flex items-center justify-center flex-1 py-3 px-2 ${
            activeTab === "amateurs"
              ? "bg-[#214A27] text-white font-semibold"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}>
          <FontAwesomeIcon
            icon={faUser}
            className="mr-2"
            style={fontStyles.tab}
          />
          <span style={fontStyles.tab}>Amateurs</span>
        </button>
        <button
          onClick={() => setActiveTab("professionals")}
          className={`flex items-center justify-center flex-1 py-3 px-2 ${
            activeTab === "professionals"
              ? "bg-[#214A27] text-white font-semibold"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}>
          <FontAwesomeIcon
            icon={faBriefcase}
            className="mr-2"
            style={fontStyles.tab}
          />
          <span className="hidden sm:inline" style={fontStyles.tab}>
            Professionals
          </span>
          <span className="inline sm:hidden" style={fontStyles.tab}>
            Pro&apos;s
          </span>
        </button>
        <button
          onClick={() => setActiveTab("clubs")}
          className={`flex items-center justify-center flex-1 py-3 px-2 ${
            activeTab === "clubs"
              ? "bg-[#214A27] text-white font-semibold"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}>
          <FontAwesomeIcon
            icon={faUsers}
            className="mr-2"
            style={fontStyles.tab}
          />
          <span style={fontStyles.tab}>Clubs</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="mb-6">{renderTabContent()}</div>
    </div>
  )
}

export default ResultsHighlightCard
