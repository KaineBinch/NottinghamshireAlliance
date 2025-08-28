import { useState } from "react"
import DownloadTemplateButton from "./downloadTemplate"
import useFetch from "../../../utils/hooks/useFetch"
import { queryBuilder } from "../../../utils/queryBuilder"
import { MODELS, QUERIES } from "../../../constants/api"

const TemplateCard = () => {
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [startTime, setStartTime] = useState("07:00")
  const [endTime, setEndTime] = useState("14:00")
  const [minuteIncrement, setMinuteIncrement] = useState(10)

  const query = queryBuilder(MODELS.events, QUERIES.eventsQuery)
  const { isLoading, isError, data, error } = useFetch(query)

  if (isLoading) {
    return <p>Loading event dates...</p>
  } else if (isError) {
    console.error("Error:", error)
    return <p>Failed to load event dates.</p>
  }

  const eventOptions = (data?.data || [])
    .filter((event) => event.eventDate)
    .map((event) => {
      const formattedDate = new Date(event.eventDate)
      const day = String(formattedDate.getDate()).padStart(2, "0")
      const month = String(formattedDate.getMonth() + 1).padStart(2, "0")
      const year = formattedDate.getFullYear()

      return {
        id: event.id,
        eventName: event.golf_club?.clubName || "TBC",
        label: `${
          event.golf_club?.clubName || "TBC"
        } - ${day}/${month}/${year}`,
        date: event.eventDate,
      }
    })

  return (
    <div className="h-full flex flex-col space-y-4 bg-gray-100 p-6 rounded-lg shadow-lg">
      <h2 className="text-lg font-semibold text-center">Download Templates</h2>
      <p className="my-6">
        Here, you can download a spreadsheet template for a specific event.
      </p>
      <div className="flex flex-col space-y-4">
        {/* Event Selection */}
        <div>
          <label className="text-sm font-medium mb-2">Choose an Event</label>
          <select
            value={selectedEvent?.date || ""}
            onChange={(e) => {
              const selected = eventOptions.find(
                (event) => event.date === e.target.value
              )
              setSelectedEvent(selected)
            }}
            className="w-full p-2 border border-gray-300 rounded">
            <option value="" disabled>
              Select an event
            </option>
            {eventOptions.length > 0 ? (
              eventOptions.map((event) => (
                <option key={event.id} value={event.date}>
                  {event.label.split(" - ")[0]} - {event.label.split(" - ")[1]}
                </option>
              ))
            ) : (
              <option disabled>No available events</option>
            )}
          </select>
        </div>

        {/* Time Inputs */}
        <div className="flex justify-between">
          <div className="flex-1 mr-2">
            <label className="text-sm font-medium mb-2">First Tee</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="flex-1 ml-2">
            <label className="text-sm font-medium mb-2">Last Tee</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </div>

        {/* Minute Increment Selector */}
        <div>
          <label className="text-sm font-medium mb-2">
            Tee Time Interval (minutes)
          </label>
          <input
            type="number"
            value={minuteIncrement}
            onChange={(e) => {
              const value = parseInt(e.target.value)
              if (!isNaN(value) && value > 0) {
                setMinuteIncrement(value)
              }
            }}
            min="1"
            step="1"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {/* Download Button */}
        <DownloadTemplateButton
          selectedEvent={selectedEvent}
          startTime={startTime}
          endTime={endTime}
          minuteIncrement={minuteIncrement}
        />
      </div>
    </div>
  )
}

export default TemplateCard
