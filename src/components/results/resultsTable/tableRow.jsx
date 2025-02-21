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
        className={`border-b border-gray-400 ${
          isExpanded ? "bg-gray-50" : "hover:bg-gray-50"
        }`}
        onClick={() => handleRowClick(row)}>
        <td className="p-2">{rowIndex + 1}</td>
        <td className="p-2">{row.name}</td>
        {!isClubView && <td className="p-2">{row.club}</td>}
        <td className="p-2">{isClubView ? row.totalPoints : row.result}</td>
      </tr>

      {isExpanded && (
        <tr>
          <td
            colSpan={isClubView ? 3 : 4}
            className="p-0 border-b border-gray-400">
            <ExpandedRowDetails
              result={
                isClubView
                  ? row.players
                  : Array.isArray(row.result)
                  ? row.result
                  : [{ date: row.eventDate, score: row.result }]
              }
              isClubView={isClubView}
            />
          </td>
        </tr>
      )}
    </>
  )
}

export default TableRow
