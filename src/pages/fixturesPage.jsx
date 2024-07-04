import PageHeader from "../components/pageHeader";
import { clubs } from "../constants/golfClubs.js";
import SmallFixtureCard from "../components/smallFixtureCard";

const FixturesPage = () => {
  return (
    <>
      <PageHeader title="Fixtures" />
      <hr className="border-black" />
      <div className="flex place-content-center mt-5">
        <div className="max-w-5xl mx-5 grid grid-cols-1 lg:grid-cols-2 gap-4 mb-[50px]">
          {clubs
            .filter((club, index) => index)
            .map((club, i) => (
              <SmallFixtureCard
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
export default FixturesPage;
