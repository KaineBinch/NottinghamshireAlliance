import CalendarButton from "./calendarButton";
import useFetch from "../utils/hooks/useFetch";
import { queryBuilder } from "../utils/queryBuilder";
import { MODELS, QUERIES } from "../constants/api";

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

const FixturesListView = () => {
  const query = queryBuilder(MODELS.events, QUERIES.eventsQuery);
  const { isLoading, isError, data, error } = useFetch(query);

  if (isLoading) {
    return <p className="pt-[85px]">Loading...</p>;
  } else if (isError) {
    console.error("Error:", error);
    return <p className="pt-[85px]">Something went wrong...</p>;
  }

  const sortedData = (data?.data || []).sort((a, b) => {
    const aHasDate = a.eventDate !== null && a.eventDate !== undefined;
    const bHasDate = b.eventDate !== null && b.eventDate !== undefined;

    if (aHasDate === bHasDate) return 0;

    if (aHasDate) return -1;

    return 1;
  });

  return (
    <div className="w-full pt-8">
      <div className="flex flex-col items-center">
        <div className="w-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-5">
          {sortedData?.map((event) => {
            const venue = event.golf_club
              ? `${event.golf_club.clubName} Golf Club`
              : "Location To be Confirmed";
            const eventType = event.eventType || "Event type to be confirmed";
            const clubAddress = event.golf_club
              ? event.golf_club.clubAddress
              : "";
            const eventDate = event.eventDate;
            const formattedDate = formatDateWithOrdinal(eventDate);

            return (
              <div
                key={event.id}
                className="border border-[#214A27] border-2 p-4 bg-[#d9d9d9] shadow-md flex flex-col items-start"
              >
                <div className="flex justify-between items-center w-full">
                  <div className="flex flex-col text-start">
                    <h3 className="text-xl font-semibold">{formattedDate}</h3>
                    <p className="text-lg font-medium">{venue}</p>
                    <p className="text-sm text-gray-500">{clubAddress}</p>
                    <p className="text-sm font-bold text-gray-500 mt-2">
                      {eventType}
                    </p>
                  </div>
                  <div className="ml-4">
                    <CalendarButton
                      date={eventDate}
                      comp={eventType}
                      name={venue}
                      address={clubAddress}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FixturesListView;
