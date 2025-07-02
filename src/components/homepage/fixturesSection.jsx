import { BASE_URL, MODELS, QUERIES } from "../../constants/api.js"
import useFetch from "../../utils/hooks/useFetch.js"
import { queryBuilder } from "../../utils/queryBuilder.js"
import FixtureCard from "../fixtures/fixtureCard.jsx"
import HomePageHeader from "./homepageHeader.jsx"
import defaultImage from "../../assets/background.jpg"
import FixturesSectionSkeleton from "./fixturesSectionSkeleton.jsx"

const FixturesSection = () => {
  const query = queryBuilder(MODELS.events, QUERIES.eventsQuery)
  const { isLoading, isError, data, error } = useFetch(query)

  if (isLoading) {
    return <FixturesSectionSkeleton />
  } else if (isError) {
    console.error("Error:", error)
    return <p className="pt-[35px]">Something went wrong...</p>
  }

  const sortedData = (data?.data || []).sort((a, b) => {
    const aHasDate = a.eventDate !== null && a.eventDate !== undefined
    const bHasDate = b.eventDate !== null && b.eventDate !== undefined

    if (aHasDate === bHasDate) return 0
    if (aHasDate) return -1
    return 1
  })

  const today = new Date()
  const futureFixtures = sortedData.filter((club) => {
    const eventDate = new Date(club.eventDate)
    return eventDate > today
  })

  const nextFixture = futureFixtures?.[0]
  const upcomingFixtures = futureFixtures?.slice(1, 3)

  if (!nextFixture && !upcomingFixtures?.length) {
    return (
      <div className="">
        <HomePageHeader
          title="Fixtures"
          subtext="Stay updated with the latest details on upcoming fixtures. Click here for more information."
          btnName="Fixtures"
          btnStyle="text-white bg-[#214A27]"
          page="fixtures"
        />
        <p className="pb-6">No upcoming fixtures available at the moment.</p>
      </div>
    )
  }

  return (
    <div className="">
      <HomePageHeader
        title="Fixtures"
        subtext="Stay updated with the latest details on upcoming fixtures. Click here for more information."
        btnName="Fixtures"
        btnStyle="text-white bg-[#214A27]"
        page="fixtures"
      />
      <div className="flex flex-col items-center mb-10 px-5">
        <h2 className="text-2xl font-bold text-black mb-4">Next Fixture</h2>

        <div className="w-auto max-w-5xl mb-10">
          {nextFixture ? (
            <FixtureCard
              key={nextFixture.id}
              name={
                nextFixture?.golf_club
                  ? `${nextFixture.golf_club.clubName} Golf Club`
                  : "Location To Be Confirmed"
              }
              address={nextFixture?.golf_club?.clubAddress}
              clubImage={
                nextFixture?.golf_club?.clubImage?.[0]?.url
                  ? `${BASE_URL}${nextFixture.golf_club.clubImage[0].url}`
                  : defaultImage
              }
              comp={
                nextFixture?.eventType || "Competition type to be confirmed"
              }
              date={nextFixture?.eventDate || "TBD"}
              competitionText={
                nextFixture?.eventType !== "Competition type to be confirmed"
                  ? ""
                  : ""
              }
            />
          ) : (
            <p>No next fixture available.</p>
          )}
        </div>

        <h3 className="text-xl font-semibold text-black mb-6">
          Upcoming Fixtures
        </h3>

        <div className="w-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingFixtures?.length > 0 ? (
            upcomingFixtures.map((club) => {
              const clubName = club?.golf_club
                ? `${club.golf_club.clubName} Golf Club`
                : "Location To Be Confirmed"
              const clubAddress = club?.golf_club?.clubAddress
              const clubImage = club?.golf_club?.clubImage?.[0]?.url
                ? `${BASE_URL}${club.golf_club.clubImage[0].url}`
                : defaultImage

              const eventDate = club?.eventDate
              const dateText = eventDate || "TBD"

              const competitionText =
                club?.eventType !== "Competition type to be confirmed"
                  ? " competition"
                  : ""

              return (
                <FixtureCard
                  key={club.id}
                  name={clubName}
                  address={clubAddress}
                  clubImage={clubImage}
                  comp={club?.eventType || "Competition type to be confirmed"}
                  date={dateText}
                  competitionText={competitionText}
                />
              )
            })
          ) : (
            <p>No upcoming fixtures.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default FixturesSection
