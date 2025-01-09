import { useState } from "react";
import { BASE_URL, MODELS, QUERIES } from "../../constants/api.js";
import useFetch from "../../utils/hooks/useFetch.js";
import { queryBuilder } from "../../utils/queryBuilder.js";
import HomePageHeader from "./homepageHeader.jsx";
import TeeTimeCard from "../teeTimeCard.jsx";

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

  const today = new Date();
  const teeTimes = data?.data || [];

  const upcomingTeeTimes = teeTimes.filter((entry) => {
    const eventDate = new Date(entry.event?.eventDate);
    return eventDate >= today;
  });

  const sortedTeeTimes = upcomingTeeTimes.sort((a, b) => {
    const dateA = new Date(a.event?.eventDate);
    const dateB = new Date(b.event?.eventDate);
    return dateA - dateB;
  });

  const nextEventDate = sortedTeeTimes[0]?.event?.eventDate;
  const teeTimesForNextEvent = sortedTeeTimes.filter(
    (entry) => entry.event?.eventDate === nextEventDate
  );

  const golfersToDisplay = (teeTime) => {
    return Array.isArray(teeTime?.golfers)
      ? teeTime.golfers.filter((golfer) =>
          golfer.golferName.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : [];
  };

  const filteredTeeTimes = searchQuery
    ? teeTimesForNextEvent.filter(
        (teeTime) => golfersToDisplay(teeTime).length > 0
      )
    : teeTimesForNextEvent.slice(0, 1);

  return (
    <div className="items-center justify-center flex flex-col w-full mx-auto max-w-5xl mb-5">
      <HomePageHeader
        title="Order of Play"
        subtext={`Type your name below to check your tee time for ${
          teeTimesForNextEvent[0]?.event?.golf_club?.clubName ||
          "the next event"
        }`}
        btnName="Start Times"
        btnStyle="text-black bg-white"
        page="starttimes"
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
              clubName={`${teeTime.event.golf_club?.clubName} Golf Club`}
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
  );
};

export default StartTimesSection;
