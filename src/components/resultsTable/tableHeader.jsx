import TableButtons from "./tableButtons";

const TableHeader = ({ onCategoryChange, category }) => {
  const headers = {
    default: ["Pos", "Name", "Club", "Points Total"],
    club: ["Pos", "Club", "Points Total"],
  };

  const currentHeaders = category === "Club" ? headers.club : headers.default;

  return (
    <>
      <TableButtons onCategoryChange={onCategoryChange} />
      <div className="flex flex-row place-content-evenly font-semibold bg-[#d9d9d9] items-center p-2 border-x-1 border-b-1 text-center">
        {currentHeaders.map((header, index) => (
          <div
            key={index}
            className={`${currentHeaders.length === 3 ? "w-1/3" : "w-1/4"}`}
          >
            {header}
          </div>
        ))}
      </div>
    </>
  );
};

export default TableHeader;
