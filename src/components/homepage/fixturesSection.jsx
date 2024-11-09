import { futureClubs } from "../../constants/golfClubs.js";
import FixtureCard from "../fixtureCard.jsx";
import HomePageHeader from "./homepageHeader.jsx";

const FixturesSection = () => {
  const nextFixture = futureClubs[0];
  const nextTwoFixtures = futureClubs.slice(1, 3);

  return (
    <>
      <div className="bg-[#d9d9d9]">
        <HomePageHeader
          title="Fixtures"
          subtext="Stay updated with the latest details on upcoming fixtures. Click here for more information."
          btnName="Fixtures"
          btnStyle="text-white bg-[#214A27]"
          page="fixtures"
        />
        <div className="flex flex-col items-center mb-10 px-5 ">
          <h2 className="text-2xl font-bold text-black mb-4">Next Fixture</h2>

          <div className="w-auto max-w-5xl mb-10">
            <FixtureCard
              name={nextFixture.name}
              address={nextFixture.address}
              courseImage={nextFixture.courseImage}
              comp={nextFixture.comp}
              date={nextFixture.date}
            />
          </div>

          <h3 className="text-xl font-semibold text-black mb-6">
            Upcoming Fixtures
          </h3>

          <div className="w-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-4">
            {nextTwoFixtures.map((club, i) => (
              <div key={i}>
                <FixtureCard
                  name={club.name}
                  address={club.address}
                  courseImage={club.courseImage}
                  comp={club.comp}
                  date={club.date}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default FixturesSection;
