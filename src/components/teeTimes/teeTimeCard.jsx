import defaultImage from "../../assets/Logo.png"

const TeeTimeCard = ({
  clubName,
  clubLogo,
  eventDate,
  golferTeeTime,
  golfers,
}) => {
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
    if (!dateString) return ""
    const date = new Date(dateString)
    const day = date.getDate()
    const ordinal = getOrdinalSuffix(day)
    return date
      .toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
      .replace(`${day}`, `${day}${ordinal}`)
  }

  const now = new Date()
  const teeDateTime =
    eventDate && golferTeeTime
      ? new Date(`${eventDate}T${golferTeeTime}`)
      : null
  const isFutureTeeTime = teeDateTime && teeDateTime > now

  if (!eventDate && !golferTeeTime && (!golfers || golfers.length === 0)) {
    return (
      <div className="bg-[#D9D9D9] border border-[#214A27] border-[6px] shadow-md p-4 rounded-md w-full max-w-md m-1">
        <div className="w-full flex justify-center items-center">
          <div className="flex flex-col w-2/3 items-start mb-4">
            <p className="text-xl font-bold text-[#214A27]">
              {clubName || "No upcoming tee times"}
            </p>
          </div>
          <div className="flex justify-center items-center drop-shadow w-1/3 relative">
            <img
              src={clubLogo || defaultImage}
              alt="Club logo"
              className="max-w-full h-[85px] object-contain drop-shadow-2xl"
            />
          </div>
        </div>
        <p className="text-lg font-bold text-black mb-2">
          No tee times available
        </p>
      </div>
    )
  }

  return (
    <div className="bg-[#D9D9D9] border border-[#214A27] border-[6px] shadow-md p-4 rounded-md w-full max-w-md m-1">
      <div className="w-full flex justify-center items-center">
        <div className="flex flex-col w-2/3 items-start mb-4">
          <p className="text-xl font-bold text-[#214A27]">{clubName || ""}</p>
          <p className="text-sm font-medium text-gray-700">
            {formatDateWithOrdinal(eventDate) || ""}
          </p>
          {teeDateTime && !isFutureTeeTime && (
            <p className="text-sm font-medium text-amber-700 mt-1">
              Past tee time
            </p>
          )}
        </div>
        <div className="flex justify-center items-center drop-shadow w-1/3 relative">
          <img
            src={clubLogo || defaultImage}
            alt={defaultImage}
            className="max-w-full h-[85px] object-contain drop-shadow-2xl"
          />
        </div>
      </div>
      <p className="text-lg font-bold text-black mb-2">
        Tee Time:{" "}
        <span className="font-bold">
          {golferTeeTime
            ? new Date(`${eventDate}T${golferTeeTime}`).toLocaleTimeString(
                "en-GB",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )
            : "Not Available"}
        </span>
      </p>
      <div className="flex flex-col items-start text-base">
        <p className="font-semibold text-black mb-2">Golfers:</p>
        {golfers.length > 0 ? (
          golfers.map((golfer) => (
            <div key={golfer.id} className="ml-2 flex items-center">
              <p className={`${golfer.isSenior ? "text-black" : "text-black"}`}>
                {golfer.golferName} - {golfer?.golf_club?.clubID}
              </p>
              <div className="flex">
                {golfer.isSenior && (
                  <p className="text-sm font-semibold ml-2 text-red-500">
                    Senior
                  </p>
                )}
                {golfer.isPro && (
                  <p className="text-sm font-semibold ml-2 text-blue-700">
                    Professional
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>No golfers found</p>
        )}
      </div>
    </div>
  )
}

export default TeeTimeCard
