const CourseCard = ({ courseImage, name, comp, date }) => {
  return (
    <div className="p-4 bg-[#214A27] shadow-lg rounded-md max-w-[350px]">
      {/* Image Section */}
      <div className="relative">
        <img
          src={courseImage}
          className="w-full h-[250px] object-cover"
          alt={`${name} course`}
        />
      </div>

      {/* Text Section (Name, Comp, Date) */}
      <div className="flex flex-col items-center text-center px-2 py-2 bg-[#D9D9D9] text-black">
        <h2 className="text-xl font-bold">{name}</h2>
        <h3 className="text-md">{comp} competition</h3>
        <h3 className="text-md">{date}</h3>
      </div>
    </div>
  );
};

export default CourseCard;
