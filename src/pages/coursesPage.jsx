import CourseCard from "../components/courseCard";
import PageHeader from "../components/pageHeader";
import { clubs } from "../constants/golfClubs";

const azCompare = (a, b) => +(a > b) * 2 - 0.5;

const CoursesPage = () => {
  return (
    <>
      <PageHeader title="Courses" />
      <hr className="border-black" />
      <div className="bg-[#D9D9D9] mb-8">
        <div className="max-w-5xl mx-auto py-5 px-4 sm:px-6 lg:px-8 text-start">
          <p>
            Discover the courses that are part of our alliance. These partner
            courses offer a variety of playing experiences, suited for golfers
            of all skill levels.
          </p>
          <p className="pt-5">
            Click on any course below to learn more and find out what makes each
            one a unique destination for your next round.
          </p>
        </div>
        <hr className="border-black" />
      </div>

      <div className="bg-[#D9D9D9]">
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="">
            {clubs
              .toSorted((a, b) => azCompare(a.name, b.name))
              .map((club, i) => (
                <CourseCard
                  key={i}
                  name={club.name}
                  address={club.address}
                  contact={club.contact}
                  link={club.link}
                  courseImage={club.courseImage}
                  logo={club.logo}
                />
              ))}
          </div>
        </div>
      </div>
    </>
  );
};
export default CoursesPage;
