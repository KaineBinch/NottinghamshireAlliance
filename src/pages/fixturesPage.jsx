import { useState, useEffect } from "react"
import PageHeader from "../components/pageHeader"
import FixtureCard from "../components/fixtures/fixtureCard"
import FixturesListView from "../components/fixtures/FixturesListView"
import { queryBuilder } from "../utils/queryBuilder"
import { BASE_URL, MODELS, QUERIES } from "../constants/api"
import useFetch from "../utils/hooks/useFetch"
import { formatClubName } from "../utils/formatClubName"
import defaultImage from "../assets/background.jpg"
import ToggleViewButton from "../components/toggleViewButton"
import { FixturesPageSkeleton } from "../components/skeletons"
import "./fixturesPage.css"

const FixturesPage = () => {
  const getSavedViewPreference = () => {
    try {
      const savedPreference = localStorage.getItem("fixturesListView")
      return savedPreference === "true"
    } catch (error) {
      return false
    }
  }

  const [isListView, setIsListView] = useState(getSavedViewPreference)
  const [showContent, setShowContent] = useState(false)

  const query = queryBuilder(MODELS.events, QUERIES.eventsQuery)
  const { isLoading, isError, data, error } = useFetch(query)

  useEffect(() => {
    const checkIfMobile = () => {
      if (window.innerWidth < 768) {
        setIsListView(true)
      }
    }

    checkIfMobile()
  }, [])

  useEffect(() => {
    if (!isLoading && data) {
      const timer = setTimeout(() => {
        setShowContent(true)
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [isLoading, data])

  useEffect(() => {
    try {
      localStorage.setItem("fixturesListView", isListView.toString())
    } catch (error) {
      console.warn("Could not save view preference")
    }
  }, [isListView])

  if (isLoading) {
    return <FixturesPageSkeleton isListView={isListView} />
  }

  if (isError) {
    console.error("Error:", error)
    return <p className="error-container">Something went wrong...</p>
  }

  const sortedData = (data?.data || []).sort((a, b) => {
    const aHasDate = a.eventDate !== null && a.eventDate !== undefined
    const bHasDate = b.eventDate !== null && b.eventDate !== undefined

    if (aHasDate === bHasDate) return 0
    if (aHasDate) return -1
    return 1
  })

  return (
    <>
      <PageHeader title="Fixtures" />
      <hr className="border-black" />
      <div className="description-section">
        <div className="description-container">
          <p>
            Welcome to this year{"'"}s fixture list. Here, you{"'"}ll find all
            the upcoming events and match dates for the season.
          </p>
          <p className="description-paragraph">
            Stay ahead by planning your schedule around these key fixtures. Make
            sure not to miss out on any of the action!
          </p>
        </div>
        <hr className="border-black" />
      </div>

      <ToggleViewButton isListView={isListView} setIsListView={setIsListView} />

      {isListView ? (
        <FixturesListView />
      ) : (
        <div className="card-view-container">
          <div className="cards-container">
            {showContent ? (
              <div className="card-grid">
                {sortedData?.map((club) => {
                  const clubName = club.golf_club
                    ? formatClubName(club.golf_club.clubName).replace(
                        "Admirals",
                        "Park"
                      )
                    : "Location To be Confirmed"
                  const clubAddress = club.golf_club
                    ? club.golf_club.clubAddress
                    : ""
                  const clubImage = club.golf_club?.clubImage?.[0]?.url
                    ? `${BASE_URL}${club.golf_club.clubImage[0].url}`
                    : defaultImage

                  const eventDate = club.eventDate
                  const dateText = eventDate ? eventDate : null

                  const competitionText =
                    club.eventType &&
                    club.eventType !== "Competition type to be confirmed"
                      ? " competition"
                      : ""

                  return (
                    <FixtureCard
                      key={club.id}
                      name={clubName}
                      address={clubAddress}
                      clubImage={clubImage}
                      comp={club.eventType}
                      date={dateText}
                      competitionText={competitionText}
                    />
                  )
                })}
              </div>
            ) : (
              <div className="loading-placeholder"></div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default FixturesPage
