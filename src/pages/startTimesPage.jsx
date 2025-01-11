import { useState } from "react";
import PageHeader from "../components/pageHeader";
import TeeTimesTable from "../components/teeTime";
import ListView from "../components/teeTimeListView";
import { queryBuilder } from "../utils/queryBuilder";
import { MODELS, QUERIES } from "../constants/api";
import useFetch from "../utils/hooks/useFetch";
import { getNextEventDate } from "../utils/getNextEventDate";

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

const StartTimesPage = () => {
  const [isListView, setIsListView] = useState(false);

  const query = queryBuilder(MODELS.teeTimes, QUERIES.teeTimesQuery);
  const { isLoading, isError, data, error } = useFetch(query);

  if (isLoading) {
    return <p className="pt-[85px]">Loading...</p>;
  } else if (isError) {
    console.error("Error:", error);
    return <p className="pt-[85px]">Something went wrong...</p>;
  }

  const nextEventDate = getNextEventDate(data);
  const nextEvent = data?.data.find(
    (entry) => entry.event?.eventDate === nextEventDate
  );

  const eventDate = nextEvent?.event?.eventDate
    ? formatDateWithOrdinal(nextEvent.event.eventDate)
    : "Upcoming Event";

  const filteredTeeTimes = nextEvent?.golfers || [];

  const handleToggleView = () => {
    setIsListView(!isListView);
  };

  return (
    <>
      <PageHeader title="Order of Play" />
      <hr className="border-black" />
      <div className="bg-[#d9d9d9]">
        <div className="max-w-5xl mx-auto py-5 px-4 sm:px-6 lg:px-8 text-start">
          <p>
            Please provide any changes or details regarding ‘unnamed’ players by
            17:00 on the Monday before the event, at the latest.
          </p>
          <p className="py-5">
            Please collect your scorecard at least 10 minutes before your
            scheduled start time.
          </p>
          <p>
            The entry fee will be payable if you fail to arrive without prior
            notification.
          </p>
        </div>
        <hr className="border-black" />
      </div>
      <div className="mt-6 flex flex-col mx-5">
        {nextEvent ? (
          <>
            <div className="justify-center items-center">
              <div>
                <h4 className="text-3xl font-bold">
                  {nextEvent.event?.golf_club?.clubName}
                </h4>
                <h4 className="text-xl mt-2">{eventDate}</h4>
              </div>
            </div>
            <div className="flex justify-end max-w-5xl mx-auto">
              <button
                onClick={handleToggleView}
                className="bg-[#214A27] text-white px-6 mt-5 py-2 rounded-lg shadow-md "
              >
                {isListView ? "Tee Time View" : "Club View"}
              </button>
            </div>
          </>
        ) : (
          <p className="text-center mt-5 text-xl">No upcoming events found.</p>
        )}
      </div>
      <div className="flex justify-center">
        <div className="max-w-5xl w-full">
          <div className="mx-5 mb-5 mt-3">
            {isListView ? (
              <ListView teeTimes={filteredTeeTimes} />
            ) : (
              <TeeTimesTable teeTimes={filteredTeeTimes} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default StartTimesPage;
