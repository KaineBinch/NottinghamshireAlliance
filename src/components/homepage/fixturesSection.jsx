import { clubs } from "../../constants/golfClubs.js";
import FixtureCard from "../fixtureCard.jsx";

const FixturesSection = () => {
  return (
    <>
      <div className="mx-5 py-[50px] flex place-content-center">
        <div className="text-start text-black max-w-5xl flex flex-col grow">
          <h1>Fixtures</h1>
          <div className="flex items-center place-content-between">
            <p className="py-[25px] pr-5">
              All the latest information about upcoming fixtures
            </p>
            <a
              className="btn rounded-none w-[125px] border-black text-white bg-[#214A27]"
              href="/#/fixtures"
            >
              Fixtures
            </a>
          </div>
        </div>
      </div>
      <div className="flex place-content-center">
        <div className="max-w-5xl mx-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-[50px]">
          {clubs
            .filter((club, index) => index < 4)
            .map((club, i) => (
              <FixtureCard
                key={i}
                name={club.name}
                address={club.address}
                courseImage={club.courseImage}
                comp={club.comp}
                dayName={club.dayName}
                day={club.day}
                month={club.month}
                year={club.year}
              />
            ))}
        </div>
      </div>
    </>
  );
};

export default FixturesSection;
