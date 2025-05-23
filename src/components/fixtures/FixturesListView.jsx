import { useState, useEffect } from "react"
import CalendarButton from "./calendarButton"
import useFetch from "../../utils/hooks/useFetch"
import { queryBuilder } from "../../utils/queryBuilder"
import { MODELS, QUERIES } from "../../constants/api"
import FixturesListViewSkeleton from "./fixturesListViewSkeleton"

const getOrdinalSuffix = (day) => {
  if (day > 3 && day < 21) return "th"
  switch (day % 10) {
    case 1:
      return "st"
    case 2:
      return "nd"
    case 3:
      return "rd"
    default:
      return "th"
  }
}

const formatDateWithOrdinal = (dateString) => {
  if (!dateString) {
    console.warn("No date string provided for formatting.")
    return "Date To Be Confirmed"
  }

  const date = new Date(dateString)
  const day = date.getDate()
  const ordinal = getOrdinalSuffix(day)

  const formattedDate = date
    .toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .replace(`${day}`, `${day}${ordinal}`)

  return formattedDate
}

const FixturesListView = () => {
  const [contentVisible, setContentVisible] = useState(false)
  const query = queryBuilder(MODELS.events, QUERIES.eventsQuery)
  const { isLoading, isError, data, error } = useFetch(query)

  useEffect(() => {
    if (!isLoading && data) {
      const timer = setTimeout(() => setContentVisible(true), 50)
      return () => clearTimeout(timer)
    }
  }, [isLoading, data])

  if (isError) {
    console.error("Error:", error)
    return <p className="pt-[85px]">Something went wrong...</p>
  }

  if (isLoading) {
    return <FixturesListViewSkeleton />
  }

  const sortedData = (data?.data || []).sort((a, b) => {
    const aHasDate = a.eventDate !== null && a.eventDate !== undefined
    const bHasDate = b.eventDate !== null && b.eventDate !== undefined

    if (aHasDate === bHasDate) return 0
    if (aHasDate) return -1
    return 1
  })

  return (
    <div className="w-full pt-4 px-2 sm:px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white shadow-md rounded-lg overflow-x-auto mb-10">
          <table className="min-w-full divide-y divide-gray-400">
            <thead className="bg-[#214A27] font-semibold text-white text-center text-xs sm:text-sm">
              <tr
                className={`transition-opacity duration-300 ${
                  contentVisible ? "opacity-100" : "opacity-0"
                } [&>th]:px-2 [&>th]:sm:px-4 [&>th]:md:px-6 [&>th]:py-2 [&>th]:md:py-3 [&>th]:tracking-wider`}>
                <th>Date</th>
                <th>Venue</th>
                <th>Competition</th>
                <th>Add to Calendar</th>
              </tr>
            </thead>
            <tbody className="bg-[#D9D9D9] divide-y divide-gray-400 text-xs sm:text-sm text-gray-900 text-center">
              {sortedData.map((event) => {
                const venue = event.golf_club
                  ? `${event.golf_club.clubName} Golf Club`
                  : "Location To Be Confirmed"
                const eventType =
                  event.eventType || "Event type to be confirmed"
                const clubAddress = event.golf_club
                  ? event.golf_club.clubAddress
                  : ""
                const eventDate = event.eventDate
                const formattedDate = formatDateWithOrdinal(eventDate)

                return (
                  <tr
                    key={event.id}
                    className="hover:bg-gray-200 [&>td]:px-2 [&>td]:sm:px-4 [&>td]:md:px-6 [&>td]:py-2 [&>td]:md:py-4 border-b border-gray-400">
                    <td>
                      <div
                        className={`font-medium transition-opacity duration-300 ${
                          contentVisible ? "opacity-100" : "opacity-0"
                        }`}>
                        {formattedDate}
                      </div>
                    </td>
                    <td>
                      <div
                        className={`font-medium transition-opacity duration-300 ${
                          contentVisible ? "opacity-100" : "opacity-0"
                        }`}>
                        {venue}
                      </div>
                      <div
                        className={`text-gray-600 hidden sm:block transition-opacity duration-300 ${
                          contentVisible ? "opacity-100" : "opacity-0"
                        }`}>
                        {clubAddress}
                      </div>
                    </td>
                    <td>
                      <div
                        className={`transition-opacity duration-300 ${
                          contentVisible ? "opacity-100" : "opacity-0"
                        }`}>
                        {eventType}
                      </div>
                    </td>
                    <td className="whitespace-nowrap">
                      <div
                        className={`transition-opacity duration-300 flex pl-2 justify-center ${
                          contentVisible ? "opacity-100" : "opacity-0"
                        }`}>
                        <CalendarButton
                          date={eventDate}
                          comp={eventType}
                          name={venue}
                          address={clubAddress}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default FixturesListView
