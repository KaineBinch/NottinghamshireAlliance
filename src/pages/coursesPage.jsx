import CourseCard from "../components/courseCard";
import PageHeader from "../components/pageHeader";
import { BASE_URL, MODELS, QUERIES } from "../constants/api";
import useFetch from "../utils/hooks/useFetch";
import { queryBuilder } from "../utils/queryBuilder";

const CoursesPage = () => {
  const query = queryBuilder(MODELS.golfClubs, QUERIES.clubsQuery);
  const { isLoading, isError, data, error } = useFetch(query);

  if (isLoading) {
    return <p className="pt-[85px]">Loading...</p>;
  } else if (isError) {
    console.error("Error:", error);
    return <p className="pt-[85px]">Something went wrong...</p>;
  }

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
            {data.data.map((club) => (
              <CourseCard
                key={club.id}
                name={`${club.clubName} Golf Club`}
                address={club.clubAddress}
                contact={club.clubContactNumber}
                link={club.clubURL}
                courseImage={
                  club.clubImage?.[0]?.url
                    ? `${BASE_URL}${club.clubImage[0].url}`
                    : "default-image.jpg"
                }
                logo={
                  club.clubLogo?.[0]?.url
                    ? `${BASE_URL}${club.clubLogo[0].url}`
                    : "default-logo.jpg"
                }
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
export default CoursesPage;
