import ExpandedRowDetails from "./expandedRow"

const TableRow = ({
  row,
  rowIndex,
  handleRowClick,
  expandedRow,
  isClubView,
}) => {
  const isExpanded = expandedRow === row

  return (
    <>
      <tr
        className={`cursor-pointer border-b border-gray-400 ${
          isExpanded ? "bg-[#D9D9D9]" : "hover:bg-[#A9A9A9]"
        }`}
        onClick={() => handleRowClick(row)}>
        <td className="p-2">{rowIndex + 1}</td>
        <td className="p-2">{row.name}</td>
        {!isClubView && <td className="p-2">{row.club}</td>}
        <td className="p-2">
          {isClubView ? row.totalPoints : row.totalPoints}
        </td>
      </tr>

      {isExpanded && (
        <tr>
          <td
            colSpan={isClubView ? 3 : 4}
            className="p-0 border-b border-gray-400">
            {isClubView && row.players ? (
              <ExpandedRowDetails
                result={row.players}
                isClubView={isClubView}
              />
            ) : isClubView && !row.players ? (
              <div>No Club Players Available</div>
            ) : (
              <ExpandedRowDetails result={row} isClubView={isClubView} />
            )}
          </td>
        </tr>
      )}
    </>
  )
}

export default TableRow
