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
    <div className="flex flex-col bg-[#D9D9D9] text-black border border-black relative max-w-[500px]">
      <div className="relative">
        <img src={courseImage} className="w-full h-[250px] object-cover" />
      </div>
      <div className="px-[30px] py-[10px] relative text-center">
        <h2 className="">{name}</h2>
        <h3 className="">{comp} competition</h3>
        <h3 className="pb-2 pt-5">{address}</h3>
      </div>
      <div className="absolute right-0 top-0 mt-4 mr-4 bg-[#D9D9D9] h-[115px] w-[115px] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center px-1">
          <h3 className="font-semibold">{dayName}</h3>
          <h2 className="font-black py-1">{day}</h2>
          <h3 className="font-semibold">
            {month} {year}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default FixtureCard;
