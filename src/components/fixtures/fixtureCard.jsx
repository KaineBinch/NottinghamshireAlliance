import { useState, useEffect } from "react"
import CalendarButton from "./calendarButton"

const FixtureCard = ({
  clubImage,
  name,
  address,
  comp,
  date,
  competitionText,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Trigger the animation once the component is mounted
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100) // Small delay to ensure DOM is ready

    return () => clearTimeout(timer)
  }, [])

  const formatDate = (dateString) => {
    if (!dateString) {
      console.error("Date string is undefined or null")
      return { year: "", month: "", monthName: "", day: "" }
    }

    const parts = dateString.split("-")
    if (parts.length !== 3) {
      console.error(
        "Date string is not in expected format YYYY-MM-DD:",
        dateString
      )
      return { year: "", month: "", monthName: "", day: "" }
    }

    const [year, month, day] = parts.map(Number)
    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      console.error("Invalid date components:", day, month, year)
      return { year: "", month: "", monthName: "", day: "" }
    }

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]

    return {
      year,
      month,
      monthName: monthNames[month - 1] || "",
      day,
    }
  }

  const { year, month, monthName, day } = formatDate(date)

  const dayName =
    day && month && year
      ? new Date(
          `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
            2,
            "0"
          )}`
        ).toLocaleDateString("en-US", { weekday: "short" })
      : "Date To Be Confirmed"

  // Base transition classes
  const fadeInClass = "transition-all duration-700 ease-in-out"
  const hiddenClass = "opacity-0 translate-y-4"
  const visibleClass = "opacity-100 translate-y-0"

  return (
    <div
      className={`p-4 bg-[#214A27] shadow-lg rounded-md ${fadeInClass} ${
        isVisible ? visibleClass : hiddenClass
      }`}>
      <div className="flex flex-col bg-[#D9D9D9] text-black border border-black relative max-w-[300px] min-h-[300px]">
        <div className="relative">
          <div className="w-full h-[250px] bg-gray-300 absolute top-0 left-0" />
          <img
            src={clubImage}
            className={`w-full h-[250px] object-cover relative transition-opacity duration-700 ease-in-out ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            alt={`${name} course`}
            onLoad={() => setImageLoaded(true)}
          />
        </div>

        <div
          className={`flex-1 flex flex-col py-1 text-center place-content-evenly md:min-h-[175px] min-h-[185px] ${fadeInClass} ${
            isVisible ? visibleClass : hiddenClass
          }`}
          style={{ transitionDelay: "100ms" }}>
          <h4
            className={`px-2 -mt-1 font-bold text-3xl md:text-2xl ${fadeInClass} ${
              isVisible ? visibleClass : hiddenClass
            }`}
            style={{ transitionDelay: "200ms" }}>
            {name}
          </h4>

          <div
            className={`flex w-full ${fadeInClass} ${
              isVisible ? visibleClass : hiddenClass
            }`}
            style={{ transitionDelay: "300ms" }}>
            <div className="flex flex-col justify-center w-full pl-4 px-2">
              <h3 className="">{address}</h3>
            </div>
            <div className="flex-shrink-0 flex items-end justify-end pr-2 lg:hidden max-w-[60px] min-w-[60px]">
              <CalendarButton
                date={date}
                comp={comp}
                name={name}
                address={address}
              />
            </div>
          </div>
          <h3
            className={`flex items-end justify-center font-semibold ${fadeInClass} ${
              isVisible ? visibleClass : hiddenClass
            }`}
            style={{ transitionDelay: "400ms" }}>
            {comp || "Competition type to be confirmed"}
            {competitionText &&
              competitionText.trim() !== "" &&
              ` ${competitionText}`}
          </h3>
        </div>

        <div
          className={`absolute right-0 top-0 mt-4 mr-4 bg-[#D9D9D9] h-[115px] w-[115px] flex flex-col items-center justify-center space-y-2 ${fadeInClass} ${
            isVisible ? visibleClass : hiddenClass
          }`}
          style={{ transitionDelay: "500ms" }}>
          <div className="flex flex-col items-center justify-center">
            <h4
              className={`font-semibold md:text-base text-lg px-1 ${fadeInClass} ${
                isVisible ? visibleClass : hiddenClass
              }`}
              style={{ transitionDelay: "550ms" }}>
              {dayName}
            </h4>
            <h4
              className={`font-semibold md:text-base text-lg py-[2px] px-1 ${fadeInClass} ${
                isVisible ? visibleClass : hiddenClass
              }`}
              style={{ transitionDelay: "600ms" }}>
              {day}
            </h4>
            <h4
              className={`font-semibold md:text-base text-lg px-1 ${fadeInClass} ${
                isVisible ? visibleClass : hiddenClass
              }`}
              style={{ transitionDelay: "650ms" }}>
              {monthName} {year}
            </h4>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FixtureCard
