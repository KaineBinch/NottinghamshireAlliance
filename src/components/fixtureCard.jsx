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
        <h2>{name}</h2>
        <h3>{comp} competition</h3>
        <h3>{address}</h3>
      </div>
      <div className="absolute right-0 top-0 mt-3 mr-3 bg-[#D9D9D9] h-[100px] w-[100px] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <p className="text-xs font-semibold">{dayName}</p>
          <p className="text-2xl font-black my-1">{day}</p>
          <p className="text-xs font-semibold">
            {month} {year}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FixtureCard;
