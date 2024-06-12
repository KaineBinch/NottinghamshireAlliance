import { clubs } from "../../constants/golfClubs";
import FixtureCard from "../fixtureCard";

const FixturesSection = () => {
  return (
    <>
      <div className="text-start mx-5 py-[25px] text-black">
        <h1 className="text-4xl font-semibold ">Fixtures</h1>
        <div className="flex items-center">
          <p className="py-6">
            All the latest information about upcoming fixtures
          </p>
          <a
            className="btn rounded-none ml-3 w-[125px] border-black text-white bg-[#214A27]"
            href="/#/fixtures"
          >
            Fixtures
          </a>
        </div>
        {clubs
          .filter((club, index) => index < 3)
          .map((club, i) => (
            <FixtureCard
              className=""
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
