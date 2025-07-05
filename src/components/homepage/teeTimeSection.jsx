import { useState } from "react"
import { BASE_URL, MODELS, QUERIES } from "../../constants/api.js"
import useFetch from "../../utils/hooks/useFetch.js"
import { queryBuilder } from "../../utils/queryBuilder.js"
import HomePageHeader from "./homepageHeader.jsx"
import TeeTimeCard from "../teeTimes/teeTimeCard.jsx"
import TeeTimeSectionSkeleton from "./teeTimeSectionSkeleton.jsx"

const TeeTimesSection = () => {
  const query = queryBuilder(MODELS.teeTimes, QUERIES.teeTimesQuery)
  const { isLoading, isError, data, error } = useFetch(query)
  const [searchQuery, setSearchQuery] = useState("")

  if (isLoading) {
    return <TeeTimeSectionSkeleton />
  } else if (isError) {
    console.error("Error:", error)
    return <p className="pt-[85px]">Something went wrong...</p>
  }

  const today = new Date()
  const teeTimes = data?.data || []

  const upcomingTeeTimes = teeTimes.filter((entry) => {
    const eventDate = new Date(entry.event?.eventDate)
    return eventDate >= today
  })

  const sortedUpcomingTeeTimes = upcomingTeeTimes.sort((a, b) => {
    const dateA = new Date(`${a.event?.eventDate}T${a.golferTeeTime}`)
    const dateB = new Date(`${b.event?.eventDate}T${b.golferTeeTime}`)
    return dateA - dateB
  })

  const pastTeeTimes = teeTimes
    .filter((entry) => {
      const eventDate = new Date(entry.event?.eventDate)
      return eventDate < today
    })
    .sort((a, b) => {
      const dateA = new Date(a.event?.eventDate)
      const dateB = new Date(b.event?.eventDate)

      if (dateA.getTime() !== dateB.getTime()) {
        return dateB - dateA
      }

      const timeA = a.golferTeeTime ? a.golferTeeTime : "23:59"
      const timeB = b.golferTeeTime ? b.golferTeeTime : "23:59"
      return timeA.localeCompare(timeB)
    })

  let teeTimesToDisplay = []
  let eventTitle = "the next event"

  if (sortedUpcomingTeeTimes.length > 0) {
    const nextEventDate = sortedUpcomingTeeTimes[0]?.event?.eventDate
    teeTimesToDisplay = sortedUpcomingTeeTimes.filter(
      (entry) => entry.event?.eventDate === nextEventDate
    )

    teeTimesToDisplay.sort((a, b) => {
      const timeA = a.golferTeeTime || "23:59"
      const timeB = b.golferTeeTime || "23:59"
      return timeA.localeCompare(timeB)
    })

    eventTitle =
      teeTimesToDisplay[0]?.event?.golf_club?.clubName || "the next event"
  } else if (pastTeeTimes.length > 0) {
    const mostRecentEventDate = pastTeeTimes[0]?.event?.eventDate

    const mostRecentDayTeeTimes = pastTeeTimes.filter(
      (entry) => entry.event?.eventDate === mostRecentEventDate
    )

    teeTimesToDisplay = mostRecentDayTeeTimes.sort((a, b) => {
      const timeA = a.golferTeeTime || "23:59"
      const timeB = b.golferTeeTime || "23:59"
      return timeA.localeCompare(timeB)
    })

    eventTitle =
      teeTimesToDisplay[0]?.event?.golf_club?.clubName ||
      "the most recent event"
  }

  const golfersToDisplay = (teeTime) => {
    return Array.isArray(teeTime?.golfers)
      ? teeTime.golfers.filter((golfer) =>
          golfer.golferName.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : []
  }

  const filteredTeeTimes = searchQuery
    ? teeTimesToDisplay.filter(
        (teeTime) => golfersToDisplay(teeTime).length > 0
      )
    : teeTimesToDisplay.slice(0, 1)

  const isPastEvent =
    pastTeeTimes.length > 0 && sortedUpcomingTeeTimes.length === 0
  const subtextPrefix = isPastEvent
    ? "View your tee time from"
    : "Type your name below to check your tee time for"

  return (
    <div className="items-center justify-center flex flex-col w-full mx-auto max-w-5xl mb-5">
      <HomePageHeader
        title="Order of Play"
        subtext={`${subtextPrefix} ${eventTitle}`}
        btnName="Tee Times"
        btnStyle="text-black bg-white"
        page="teetimes"
      />
      <div className="flex justify-center w-full -mt-5 p-5">
        <input
          type="text"
          placeholder="Search for a name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 border border-[#214A27] w-full placeholder-gray-500 text-black h-12 bg-[#D9D9D9] drop-shadow rounded-none"
        />
      </div>
      {filteredTeeTimes.length === 0 ? (
        <div className="flex flex-col w-full p-5 mx-auto items-center">
          <TeeTimeCard
            clubName=""
            clubLogo=""
            eventDate=""
            golferTeeTime=""
            golfers={[]}
          />
        </div>
      ) : (
        <div className="flex flex-col w-full p-5 mx-auto items-center">
          {filteredTeeTimes.map((teeTime) => (
            <TeeTimeCard
              key={teeTime.id}
              clubName={
                teeTime.event.golf_club?.clubName
                  ? `${teeTime.event.golf_club.clubName} Golf Club`
                  : "Location to be confirmed"
              }
              clubLogo={
                teeTime.event.golf_club?.clubLogo?.[0]?.url
                  ? `${BASE_URL}${teeTime.event.golf_club.clubLogo[0].url}`
                  : ""
              }
              eventDate={teeTime.event.eventDate}
              golferTeeTime={teeTime.golferTeeTime}
              golfers={golfersToDisplay(teeTime)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default TeeTimesSection
