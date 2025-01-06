import { useState } from "react";
import { BASE_URL, MODELS, QUERIES } from "../../constants/api.js";
import useFetch from "../../utils/hooks/useFetch.js";
import { queryBuilder } from "../../utils/queryBuilder.js";
import HomePageHeader from "./homepageHeader.jsx";

const StartTimesSection = () => {
  const query = queryBuilder(MODELS.teeTimes, QUERIES.teeTimesQuery);
  const { isLoading, isError, data, error } = useFetch(query);
  const [searchQuery, setSearchQuery] = useState("");

  if (isLoading) {
    return <p className="pt-[85px]">Loading...</p>;
  } else if (isError) {
    console.error("Error:", error);
    return <p className="pt-[85px]">Something went wrong...</p>;
  }

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const teeTimes = data?.data || [];
  const defaultTeeTime = teeTimes[0];

  const filteredData = teeTimes.filter((entry) => {
    const golferNames = Array.isArray(entry.golfers)
      ? entry.golfers.map((golfer) => golfer.golferName.toLowerCase())
      : [];
    return golferNames.some((name) => name.includes(searchQuery));
  });

  const displayTeeTime =
    searchQuery && filteredData.length > 0 ? filteredData[0] : defaultTeeTime;

  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  const formatDateWithOrdinal = (dateString) => {
    if (!dateString) {
      console.warn("No date string provided for formatting.");
      return "Invalid Date";
    }

    const date = new Date(dateString);

    const day = date.getDate();
    const ordinal = getOrdinalSuffix(day);

    const formattedDate = date
      .toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
      .replace(`${day}`, `${day}${ordinal}`);

    return formattedDate;
  };

  const eventDate = displayTeeTime?.event?.eventDate
    ? formatDateWithOrdinal(displayTeeTime.event.eventDate)
    : "Upcoming Event";

  const subtext = `Type your name below to check your tee time for ${
    defaultTeeTime?.event?.golf_club?.clubName || "the next fixture"
  }`;

  return (
    <div className="items-center justify-center flex flex-col w-full mx-auto max-w-5xl mb-5">
      <HomePageHeader
        title="Order of Play"
        subtext={subtext}
        btnName="Start Times"
        btnStyle="text-black bg-white"
        page="starttimes"
      />
      <div className="flex justify-center w-full -mt-5 p-5">
        <input
          type="text"
          placeholder="Search for a name..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="p-2 border border-[#214A27] w-full placeholder-gray-500 text-black h-12 bg-[#D9D9D9] drop-shadow rounded-none"
        />
      </div>
      <div className="flex justify-center w-full p-5">
        <div className="flex flex-col bg-[#D9D9D9] border border-[#214A27] border-[6px] shadow-md p-4 rounded-md w-full max-w-md">
          <div className="w-full flex justify-center items-center">
            {/* Text Section */}
            <div className="flex flex-col w-2/3 items-start mb-4">
              <p className="text-xl font-bold text-[#214A27]">
                {displayTeeTime?.event?.golf_club?.clubName ||
                  "Loading Club Name..."}
              </p>
              <p className="text-sm font-medium text-gray-700">
                {eventDate !== "Upcoming Event" ? (
                  eventDate
                ) : (
                  <em>{eventDate}</em>
                )}
              </p>
            </div>

            {/* Image Section */}
            <div className="flex justify-center items-center w-1/3 relative">
              <img
                src={
                  displayTeeTime?.event?.golf_club?.clubLogo?.[0]?.url
                    ? `${BASE_URL}${displayTeeTime.event.golf_club.clubLogo[0].url}`
                    : ""
                }
                alt=""
                className="max-w-full h-[85px] object-contain drop-shadow-2xl"
              />
            </div>
          </div>
          <p className="text-lg font-bold text-black mb-2">
            Tee Time:{" "}
            <span className="font-bold">
              {displayTeeTime?.golferTeeTime
                ? new Date(
                    `1970-01-01T${displayTeeTime.golferTeeTime}`
                  ).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "N/A"}
            </span>
          </p>
          <div className="flex flex-col items-start text-base">
            <p className="font-semibold text-black mb-2">Golfers:</p>
            {Array.isArray(displayTeeTime?.golfers) &&
              displayTeeTime.golfers.map((golfer) => (
                <div key={golfer.id} className="ml-2 flex items-center ">
                  <p
                    className={`${
                      searchQuery &&
                      golfer.golferName.toLowerCase().includes(searchQuery)
                        ? "font-bold text-[#214A27]"
                        : "text-black"
                    }`}
                  >
                    {golfer.golferName} - {golfer.golf_club.clubID}
                  </p>
                  {golfer.isSenior && (
                    <p className="text-sm font-semibold ml-2 text-red-500 ">
                      Senior
                    </p>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartTimesSection;
