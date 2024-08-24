import PageHeader from "../components/pageHeader";
import { clubs } from "../constants/golfClubs.js";
import FixtureCard from "../components/fixtureCard";

const FixturesPage = () => {
  return (
    <>
      <PageHeader title="Fixtures" />
      <hr className="border-black" />
      <div
        className="-mt-5 w-full"
        style={{
          background: "linear-gradient(to bottom, #214A27, #17331B)",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="flex place-content-center mt-5">
          <div className="max-w-5xl mx-5 grid grid-cols-1 md:grid-cols-2 gap-x-4 lg:grid-cols-4 mb-[50px]">
            {clubs.map((club, i) => (
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
      </div>
    </>
  );
};

export default FixturesPage;
