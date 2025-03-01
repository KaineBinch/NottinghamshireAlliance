import HomePageHeader from "./homepageHeader"

const CoursesSection = () => {
  return (
    <>
      <div className="bg-[#d9d9d9]">
        <HomePageHeader
          title="Courses"
          subtext="Discover the courses in our alliance by clicking here to explore them."
          btnName="Courses"
          btnStyle="text-black bg-white"
          page="courses"
        />
      </div>
    </>
  )
}

export default CoursesSection
