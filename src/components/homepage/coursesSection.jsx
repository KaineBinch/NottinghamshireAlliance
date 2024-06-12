const CoursesSection = () => {
  return (
    <>
      <div className="bg-[#D9D9D9]">
        <div className="text-start mx-5 py-[25px] text-black">
          <h1 className="text-4xl font-semibold ">Courses</h1>
          <div className="flex items-center">
            <p className="py-6">
              Explore the courses within our alliance by clicking here.
            </p>
            <a
              className="btn rounded-none ml-3 w-[125px] border-black text-black bg-white"
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
