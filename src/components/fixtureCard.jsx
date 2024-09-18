const FixtureCard = ({ courseImage, name, address, comp, date }) => {
  const formatDate = (dateString) => {
    if (!dateString) {
      console.error("Date string is undefined or null");
      return { day: "", monthName: "", year: "" };
    }

    const parts = dateString.split("/");
    if (parts.length !== 3) {
      console.error(
        "Date string is not in expected format DD/MM/YYYY:",
        dateString
      );
      return { day: "", monthName: "", year: "" };
    }

    const [day, month, year] = parts.map(Number);
    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      console.error("Invalid date components:", day, month, year);
      return { day: "", monthName: "", year: "" };
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
      day,
      monthName: monthNames[month - 1] || "",
      year,
    };
  };

  const { day, monthName, year } = formatDate(date);

  const dayName =
    day && monthName && year
      ? new Date(
          `${year}-${String(date.split("/")[1]).padStart(2, "0")}-${String(
            day
          ).padStart(2, "0")}`
        ).toLocaleDateString("en-US", { weekday: "short" })
      : "";

  return (
    <div className="p-4 bg-[#214A27] shadow-lg rounded-md">
      <div className="flex flex-col bg-[#D9D9D9] text-black border border-black relative max-w-[500px] min-h-[470px]">
        <div className="relative">
          <img
            src={courseImage}
            className="w-full h-[250px] object-cover"
            alt={`${name} course`}
          />
        </div>
        <div className="flex-1 flex flex-col place-content-evenly px-2 py-2 text-center min-h-[175px]">
          <h2>{name}</h2>
          <h3>{address}</h3>
          <h3 className="pb-2 pt-5">{comp} competition</h3>
        </div>
        <div className="absolute right-0 top-0 mt-4 mr-4 bg-[#D9D9D9] h-[115px] w-[115px] flex items-center justify-center">
          <div className="flex flex-col items-center justify-center px-1">
            <h3 className="font-semibold">{dayName}</h3>
            <h2 className="font-black py-1">{day}</h2>
            <h3 className="font-semibold">
              {monthName} {year}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FixtureCard;
