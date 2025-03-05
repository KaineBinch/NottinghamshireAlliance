import { useState, useEffect } from "react"
import PageHeader from "../components/pageHeader"
import FixtureCard from "../components/fixtures/fixtureCard"
import FixtureCardSkeleton from "../components/fixtures/fixtureCardSkeleton"
import FixturesListView from "../components/fixtures/FixturesListView"
import FixturesListViewSkeleton from "../components/fixtures/fixturesListViewSkeleton"
import { queryBuilder } from "../utils/queryBuilder"
import { BASE_URL, MODELS, QUERIES } from "../constants/api"
import useFetch from "../utils/hooks/useFetch"
import defaultImage from "../assets/background.jpg"

const FixturesPage = () => {
  const [isListView, setIsListView] = useState(false)

  const query = queryBuilder(MODELS.events, QUERIES.eventsQuery)
  const { isLoading, isError, data, error } = useFetch(query)

  const skeletonCards = Array(6).fill(0)

  useEffect(() => {
    const checkIfMobile = () => {
      if (window.innerWidth < 768) {
        setIsListView(true)
      }
    }

    checkIfMobile()
  }, [])

  if (isError) {
    console.error("Error:", error)
    return <p className="pt-[85px]">Something went wrong...</p>
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
      <div className="bg-[#d9d9d9]">
        <div className="max-w-5xl mx-auto py-5 px-4 sm:px-6 lg:px-8 text-start">
          <p>
            Welcome to this year{"'"}s fixture list. Here, you{"'"}ll find all
            the upcoming events and match dates for the season.
          </p>
          <p className="pt-5">
            Stay ahead by planning your schedule around these key fixtures. Make
            sure not to miss out on any of the action!
          </p>
        </div>
        <hr className="border-black" />
      </div>

      <div className="flex justify-center pt-4">
        <button
          onClick={() => setIsListView(!isListView)}
          className="bg-[#214A27] text-white px-6 mt-5 py-2 rounded-lg shadow-md -mb-4">
          {isListView ? "Switch to Card View" : "Switch to List View"}
        </button>
      </div>

      {isListView ? (
        isLoading ? (
          <FixturesListViewSkeleton />
        ) : (
          <FixturesListView />
        )
      ) : (
        <div className="w-full pt-8">
          <div className="flex flex-col items-center">
            <div className="w-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-5">
              {isLoading
                ? skeletonCards.map((_, index) => (
                    <FixtureCardSkeleton key={index} />
                  ))
                : sortedData?.map((club) => {
                    const clubName = club.golf_club
                      ? `${club.golf_club.clubName} Golf Club`
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
          </div>
        </div>
      )}
    </>
  )
}

export default FixturesPage
