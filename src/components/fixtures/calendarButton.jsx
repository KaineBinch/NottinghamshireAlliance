import calendarAddIcon from "../../assets/calendarAdd.svg"

const CalendarButton = ({ date, comp, name, address }) => {
  const formatDateForICS = (dateString) => {
    if (!dateString) {
      throw new Error("Date string is undefined or null.")
    }

    const isISOFormat = /^\d{4}-\d{2}-\d{2}$/.test(dateString)
    let year, month, day

    let parts
    if (isISOFormat) {
      parts = dateString.split("-").map(Number)
      ;[year, month, day] = parts
    } else {
      parts = dateString.split("/").map(Number)
      ;[day, month, year] = parts
    }

    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      throw new Error("Invalid date components in formatDateForICS.")
    }

    const start = new Date(year, month - 1, day, 7, 0, 0)
    const end = new Date(start.getTime() + 10 * 60 * 60 * 1000)

    const toICSFormat = (date) =>
      date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"

    return {
      start: toICSFormat(start),
      end: toICSFormat(end),
    }
  }

  const handleAddToCalendar = () => {
    try {
      const { start, end } = formatDateForICS(date)

      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//YourApp//EN
BEGIN:VEVENT
UID:${Date.now()}@yourapp.com
DTSTAMP:${start}
DTSTART:${start}
DTEND:${end}
SUMMARY:${comp} at ${name}
LOCATION:${address}
DESCRIPTION:You're invited to join the ${comp} competition at ${name}. Don't miss out!
END:VEVENT
END:VCALENDAR`

      const isIOS =
        /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream

      if (isIOS) {
        const encodedContent = encodeURIComponent(icsContent)
        const dataUri = `data:text/calendar;charset=utf8,${encodedContent}`

        window.open(dataUri)
      } else {
        const blob = new Blob([icsContent.trim()], { type: "text/calendar" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${comp.replace(/\s+/g, "_")}_${name.replace(
          /\s+/g,
          "_"
        )}.ics`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("Failed to add to calendar:", error.message)
      alert(
        "Sorry, there was a problem adding this event to your calendar. Please try again later."
      )
    }
  }

  return (
    <button
      onClick={handleAddToCalendar}
      className="flex items-center transition-transform duration-200 ease-in-out transform hover:scale-110 active:scale-90">
      <img src={calendarAddIcon} alt="Add to Calendar" className="w-16 h-16" />
    </button>
  )
}

export default CalendarButton
