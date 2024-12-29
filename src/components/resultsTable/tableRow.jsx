import { calculateTotalPoints as transformResults } from "../../utils/transformResults";
import ExpandedRowDetails from "../resultsTable/expandedRow";

const TableRow = ({
  row,
  rowIndex,
  handleRowClick,
  expandedRow,
  isClubView,
}) => {
  const widthClass = isClubView ? "w-1/3" : "w-1/4";

  return (
    <>
      <div
        className="flex flex-row place-content-evenly items-center h-full cursor-pointer hover:bg-gray-100 min-h-[25px]"
        onClick={() => handleRowClick(rowIndex)}
      >
        <div className={`${widthClass} p-2 text-center`}>{rowIndex + 1}</div>
        <div
          className={`${widthClass} p-2 ${
            isClubView ? "text-center" : "text-left overflow-x-hidden px-1 pr-5"
          }`}
        >
          {row.name}
        </div>
        <div
          className={`${widthClass} p-2 text-center ${isClubView && "hidden"}`}
        >
          {row.club}
        </div>
        <div className={`${widthClass} p-2 text-center`}>
          {isClubView ? row.totalPoints : transformResults(row.result)}
        </div>
      </div>

      {expandedRow === rowIndex && (
        <ExpandedRowDetails result={row.result} isClubView={isClubView} />
      )}
    </>
  );
};

export default TableRow;
