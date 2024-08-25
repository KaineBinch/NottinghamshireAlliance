import { clubs } from "../../constants/golfClubs.js";
import FixtureCard from "../fixtureCard.jsx";
import HomePageHeader from "./homepageHeader.jsx";

const FixturesSection = () => {
  return (
    <>
      <HomePageHeader
        title="Fixtures"
        subtext="All the latest information about upcoming fixtures"
        btnName="Fixtures"
        btnStyle="text-white bg-[#214A27]"
      />
      <div className="flex place-content-center">
        <div className="max-w-5xl mx-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-[50px]">
          {clubs
            .filter((_, i) => i < 4)
            .map((club, i) => (
              <FixtureCard
                key={i}
                name={club.name}
                address={club.address}
                courseImage={club.courseImage}
                comp={club.comp}
                dayName={club.dayName}
                day={club.day}
                monthName={club.monthName}
                year={club.year}
              />
            ))}
        </div>
      </div>
    </>
  );
};

export default FixturesSection;
