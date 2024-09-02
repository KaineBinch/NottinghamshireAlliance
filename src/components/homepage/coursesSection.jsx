import HomePageHeader from "./homepageHeader";

const CoursesSection = () => {
  return (
    <>
      <div className="bg-[#D9D9D9]">
        <HomePageHeader
          title="Courses"
          subtext="Explore the courses within our alliance by clicking here."
          btnName="Courses"
          btnStyle="text-black bg-white"
        />
      </div>
    </>
  );
};

export default CoursesSection;
