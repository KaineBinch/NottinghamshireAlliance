const FixtureCard = ({
  courseImage,
  name,
  address,
  comp,
  dayName,
  day,
  month,
  year,
}) => {
  return (
    <>
      <div className="flex h-[450px] bg-[#D9D9D9] w-full text-black border border-black mb-4 relative">
        <div className="flex flex-col relative">
          <div className="relative">
            <img src={courseImage} className="w-full h-[250px]" />
            <div className="absolute top-0 left-0 w-full h-full "></div>
          </div>
          <div className="px-8 relative z-10">
            <h3 className="text-sm pb-4 pt-2">Next Fixture</h3>
            <h1 className="text-2xl font-bold pb-5">{name}</h1>
            <h3 className="text-sm pb-5">{address}</h3>
            <h2 className="text-md">{comp} competition</h2>
          </div>
          <div className="absolute right-0 mt-3 mr-3 bg-[#D9D9D9] h-[100px] w-[100px]">
            <div className="flex items-center justify-center h-full w-full">
              <div className="flex flex-col items-center justify-center">
                <p className="text-xs font-semibold">{dayName}</p>
                <p className="text-2xl font-black my-1">{day}</p>
                <p className="text-xs font-semibold">
                  {month} {year}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default FixtureCard;
