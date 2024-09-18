import PageHeader from "../components/pageHeader";
import { clubs } from "../constants/golfClubs.js";
import FixtureCard from "../components/fixtureCard";

const FixturesPage = () => {
  return (
    <>
      <PageHeader title="Fixtures" />
      <hr className="border-black" />
      <div className="bg-[#d9d9d9]">
        <div className="max-w-5xl mx-auto py-5 px-4 sm:px-6 lg:px-8 text-start">
          <p>
            Welcome to this year{"'"}s fixture list. Here, you{"'"}ll find all
            the upcoming events and match dates for the season.
          </p>
          <p className="pt-5">
            Stay ahead by planning your schedule around these key fixtures. Make
            sure not to miss out on any of the action!
          </p>
        </div>
        <hr className="border-black" />
      </div>

      <div className="w-full pt-8">
        <div className="flex flex-col items-center">
          <div className="w-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-5">
            {clubs.map((club, i) => (
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

export default FixturesPage;
