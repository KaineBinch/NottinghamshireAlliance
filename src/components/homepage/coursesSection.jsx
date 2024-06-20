const CoursesSection = () => {
  return (
    <>
      <div className="bg-[#D9D9D9] flex place-content-center">
        <div className="text-start px-5 py-[50px] text-black max-w-5xl flex flex-col grow">
          <h1>Courses</h1>
          <div className="flex items-center place-content-between">
            <p className="py-6 pr-5">
              Explore the courses within our alliance by clicking here.
            </p>
            <a
              className="btn rounded-none w-[125px] border-black text-black bg-white"
              href="/#/courses"
            >
              Courses
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default CoursesSection;
