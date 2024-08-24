const SmallFixtureCard = ({
  name,
  address,
  comp,
  dayName,
  day,
  month,
  year,
}) => {
  return (
    <div className="flex flex-col bg-[#D9D9D9] border border-black my-1">
      <div className="flex flex-col mx-5">
        <h4 className="font-bold pt-5 text-lg">{dayName}</h4>
        <h4 className="font-black py-2 text-lg">{day}</h4>
        <h4 className="font-bold pb-5 text-lg">
          {month} {year}
        </h4>
        <div className="flex flex-col ">
          <hr className="border-black w-4/5 mx-auto pb-5" />
          <div className="py-[10px] px-5 relative text-start ml-5">
            <h2 className="">{name}</h2>
            <h3 className="py-5 text-lg">{address}</h3>
            <h3 className="pb-5 text-lg">{comp} competition</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmallFixtureCard;
