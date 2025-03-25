import CourseCard from "../components/courses/courseCard"
import CourseCardSkeleton from "../components/courses/courseCardSkeleton"
import PageHeader from "../components/pageHeader"
import { BASE_URL, MODELS, QUERIES } from "../constants/api"
import useFetch from "../utils/hooks/useFetch"
import { queryBuilder } from "../utils/queryBuilder"
import "./CoursesPage.css"

const CoursesPage = () => {
  const query = queryBuilder(MODELS.golfClubs, QUERIES.clubsQuery)
  const { isLoading, isError, data, error } = useFetch(query)

  const skeletonCards = Array(4).fill(0)

  if (isError) {
    console.error("Error:", error)
    return <p className="error-container">Something went wrong...</p>
  }

  return (
    <>
      <PageHeader title="Courses" />
      <hr className="border-black" />
      <div className="description-section">
        <div className="description-container">
          <p>
            Discover the courses that are part of our alliance. These partner
            courses offer a variety of playing experiences, suited for golfers
            of all skill levels.
          </p>
          <p className="description-paragraph">
            Click on any course below to learn more and find out what makes each
            one a unique destination for your next round.
          </p>
        </div>
        <hr className="border-black" />
      </div>

      <div className="courses-section">
        <div className="courses-container">
          <div className="courses-grid">
            {isLoading
              ? skeletonCards.map((_, index) => (
                  <CourseCardSkeleton key={index} />
                ))
              : data.data.map((club) => (
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
  )
}
export default CoursesPage
