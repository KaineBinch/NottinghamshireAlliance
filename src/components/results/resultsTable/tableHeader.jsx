import TableButtons from "./tableButtons"

const TableHeader = ({ onCategoryChange, category }) => {
  const headers = {
    default: ["Pos", "Name", "Club", "Points Total"],
    club: ["Pos", "Club", "Points Total"],
  }

  const currentHeaders = category === "Club" ? headers.club : headers.default

  return (
    <thead>
      <tr>
        <th colSpan={currentHeaders.length} className="p-0">
          <TableButtons onCategoryChange={onCategoryChange} />
        </th>
      </tr>
      <tr className="bg-[#D9D9D9] border-b border-gray-400">
        {currentHeaders.map((header, index) => (
          <th key={index} className="py-2 px-4 text-center font-medium">
            {header}
          </th>
        ))}
      </tr>
    </thead>
  )
}

export default TableHeader
