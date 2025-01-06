import calendarAddIcon from "../assets/calendarAdd.svg";

const FixtureCard = ({
  clubImage,
  name,
  address,
  comp,
  date,
  competitionText,
}) => {
  const formatDate = (dateString) => {
    if (!dateString) {
      console.error("Date string is undefined or null");
      return { year: "", month: "", monthName: "", day: "" };
    }

    const parts = dateString.split("-");
    if (parts.length !== 3) {
      console.error(
        "Date string is not in expected format YYYY-MM-DD:",
        dateString
      );
      return { year: "", month: "", monthName: "", day: "" };
    }

    const [year, month, day] = parts.map(Number);
    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      console.error("Invalid date components:", day, month, year);
      return { year: "", month: "", monthName: "", day: "" };
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
    ];

    return {
      year,
      month,
      monthName: monthNames[month - 1] || "",
      day,
    };
  };

  const { year, month, monthName, day } = formatDate(date);

  const dayName =
    day && month && year
      ? new Date(
          `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
            2,
            "0"
          )}`
        ).toLocaleDateString("en-US", { weekday: "short" })
      : "Date to be confirmed";

  const formatDateForICS = (dateString) => {
    if (!dateString) {
      throw new Error("Date string is undefined or null.");
    }

    const isISOFormat = /^\d{4}-\d{2}-\d{2}$/.test(dateString);
    let year, month, day;

    if (isISOFormat) {
      [year, month, day] = dateString.split("-").map(Number);
    } else {
      [day, month, year] = dateString.split("/").map(Number);
    }

    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      throw new Error("Invalid date components in formatDateForICS.");
    }

    const start = new Date(year, month - 1, day, 7, 0, 0);
    const end = new Date(start.getTime() + 10 * 60 * 60 * 1000);

    const toICSFormat = (date) =>
      date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    return {
      start: toICSFormat(start),
      end: toICSFormat(end),
    };
  };

  const handleAddToCalendar = () => {
    try {
      const { start, end } = formatDateForICS(date);

      const icsContent = `
            BEGIN:VCALENDAR
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
            END:VCALENDAR
          `;

      const blob = new Blob([icsContent.trim()], { type: "text/calendar" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${comp.replace(/\s+/g, "_")}_${name.replace(
        /\s+/g,
        "_"
      )}.ics`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to add to calendar:", error.message);
    }
  };

  const CalendarButton = () => (
    <button
      onClick={handleAddToCalendar}
      className="flex items-center transition-transform duration-200 ease-in-out transform hover:scale-110 active:scale-90"
    >
      <img src={calendarAddIcon} alt="Add to Calendar" className="w-16 h-16" />
    </button>
  );

  return (
    <div className="p-4 bg-[#214A27] shadow-lg rounded-md">
      <div className="flex flex-col bg-[#D9D9D9] text-black border border-black relative max-w-[300px] min-h-[300px]">
        <div className="relative">
          <img
            src={clubImage}
            className="w-full h-[250px] object-cover"
            alt={`${name} course`}
          />
        </div>

        <div className="flex-1 flex flex-col py-1 text-center place-content-evenly md:min-h-[175px] min-h-[185px]">
          <h4 className="px-2 -mt-1 font-bold text-3xl md:text-2xl">{name}</h4>

          <div className="flex w-full">
            <div className="flex flex-col justify-center w-full pl-4 px-2">
              <h3 className="">{address}</h3>
            </div>
            <div className="flex-shrink-0 flex items-end justify-end pr-2 lg:hidden">
              <CalendarButton />
            </div>
          </div>
          <h3 className="flex items-end justify-center font-semibold">
            {comp || "Competition type to be confirmed"}
            {competitionText && ` ${competitionText}`}{" "}
          </h3>
        </div>

        <div className="absolute right-0 top-0 mt-4 mr-4 bg-[#D9D9D9] h-[115px] w-[115px] flex flex-col items-center justify-center space-y-2">
          <div className="flex flex-col items-center justify-center">
            <h4 className="font-semibold md:text-base text-lg px-1">
              {dayName}
            </h4>
            <h4 className="font-semibold md:text-base text-lg py-[2px] px-1">
              {day}
            </h4>
            <h4 className="font-semibold md:text-base text-lg px-1">
              {monthName} {year}
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FixtureCard;
