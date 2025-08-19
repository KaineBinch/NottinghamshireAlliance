const TopWinnersTable = ({ data, title }) => (
  <div className="mb-5">
    <h3 className="text-[#214A27] font-bold text-sm mb-1">{title}</h3>
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-[#214A27] text-white">
          {data.headerRow.map((cell, index) => (
            <th key={index} className="border border-gray-300 p-1 text-center">
              {cell}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.rows.map((row, rowIndex) => (
          <tr
            key={rowIndex}
            className={rowIndex % 2 === 0 ? "bg-[#d9d9d9]" : "bg-white"}>
            {row.map((cell, cellIndex) => (
              <td key={cellIndex} className="border border-gray-300 p-1">
                {typeof cell === "object" && cell?.content ? (
                  <div className="flex items-center">
                    <span>{cell.content}</span>
                    {cell.usedTiebreaker && (
                      <span
                        className="text-blue-700 ml-1 text-xs font-medium"
                        title={`Back 9: ${cell.back9Score}`}>
                        (B9: {cell.back9Score})
                      </span>
                    )}
                  </div>
                ) : (
                  cell
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export default TopWinnersTable
