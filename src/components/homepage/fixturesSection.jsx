import { clubs } from "../../constants/golfClubs.js";
import FixtureCard from "../fixtureCard.jsx";

const FixturesSection = () => {
  return (
    <>
      <div className="mx-5 py-[50px]">
        <div className="sm:text-start md:text-center text-black">
          <h1>Fixtures</h1>
          <p className="py-[25px]">
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
      <div className="mx-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-[50px]">
        {clubs
          .filter((club, index) => index < 3)
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
    </>
  );
};

export default FixturesSection;
