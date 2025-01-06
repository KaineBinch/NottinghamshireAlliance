import { BASE_URL, MODELS, QUERIES } from "../../constants/api.js";
import useFetch from "../../utils/hooks/useFetch.js";
import { queryBuilder } from "../../utils/queryBuilder.js";
import FixtureCard from "../fixtureCard.jsx";
import HomePageHeader from "./homepageHeader.jsx";

const FixturesSection = () => {
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

  const today = new Date();

  const futureFixtures = sortedData.filter((club) => {
    const eventDate = new Date(club.eventDate);
    const hasGolfClub = club.golf_club;
    return eventDate > today && hasGolfClub;
  });

  const nextFixture = futureFixtures?.[0];
  const upcomingFixtures = futureFixtures?.slice(1, 3);

  return (
    <div className="bg-[#d9d9d9]">
      <HomePageHeader
        title="Fixtures"
        subtext="Stay updated with the latest details on upcoming fixtures. Click here for more information."
        btnName="Fixtures"
        btnStyle="text-white bg-[#214A27]"
        page="fixtures"
      />
      <div className="flex flex-col items-center mb-10 px-5">
        <h2 className="text-2xl font-bold text-black mb-4">Next Fixture</h2>

        <div className="w-auto max-w-5xl mb-10">
          {nextFixture && nextFixture.golf_club && (
            <FixtureCard
              key={nextFixture.id}
              name={`${nextFixture.golf_club.clubName} Golf Club`}
              address={nextFixture.golf_club.clubAddress}
              clubImage={
                nextFixture.golf_club.clubImage?.[0]?.url
                  ? `${BASE_URL}${nextFixture.golf_club.clubImage[0].url}`
                  : "default-image.jpg"
              }
              comp={nextFixture.eventType}
              date={nextFixture.eventDate || "TBD"}
              competitionText={
                nextFixture.eventType === "Away Trip" ? "" : " competition"
              }
            />
          )}
        </div>

        <h3 className="text-xl font-semibold text-black mb-6">
          Upcoming Fixtures
        </h3>

        <div className="w-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingFixtures?.map((club) => {
            if (!club.golf_club) return null;

            return (
              <FixtureCard
                key={club.id}
                name={`${club.golf_club.clubName} Golf Club`}
                address={club.golf_club.clubAddress}
                clubImage={
                  club.golf_club.clubImage?.[0]?.url
                    ? `${BASE_URL}${club.golf_club.clubImage[0].url}`
                    : "default-image.jpg"
                }
                comp={club.eventType}
                date={club.eventDate || "TBD"}
                competitionText={
                  club.eventType === "Away Trip" ? "" : " competition"
                }
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FixturesSection;
