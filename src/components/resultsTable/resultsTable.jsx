import { useState } from "react";
import { results } from "../../constants/results";
import { calculateTotalPoints } from "../../utils/transformResults";
import TableHeader from "../resultsTable/tableHeader";
import TableRow from "../resultsTable/tableRow";

const ResultsTable = ({ limit }) => {
  const [expandedRow, setExpandedRow] = useState(null);
  const [category, setCategory] = useState("Amateur");

  const handleRowClick = (rowIndex) => {
    setExpandedRow(expandedRow === rowIndex ? null : rowIndex);
  };

  const filteredResults = () => {
    if (category === "Professional") return results.filter((row) => row.isPro);
    if (category === "Senior") return results.filter((row) => row.isSenior);
    if (category === "Club") {
      const clubMap = results.reduce((acc, row) => {
        const totalPoints = calculateTotalPoints(row.result);
        if (acc[row.club]) {
          acc[row.club].totalPoints += totalPoints;
          acc[row.club].players.push(row);
        } else {
          acc[row.club] = { club: row.club, totalPoints, players: [row] };
        }
        return acc;
      }, {});

      return Object.values(clubMap).map(({ club, totalPoints, players }) => ({
        name: club,
        totalPoints,
        result: players.flatMap((player) => player.result),
      }));
    }
    return results.filter((row) => !row.isPro);
  };

  const sortedResults = filteredResults().sort((a, b) => {
    const totalPointsA = a.totalPoints || calculateTotalPoints(a.result);
    const totalPointsB = b.totalPoints || calculateTotalPoints(b.result);
    return totalPointsB - totalPointsA;
  });

  const displayedResults = limit
    ? sortedResults.slice(0, limit)
    : sortedResults;

  return (
    <div className="flex justify-center my-8">
      <div className="bg-white shadow-md w-full max-w-5xl">
        <TableHeader onCategoryChange={setCategory} category={category} />
        {displayedResults.map((row, rowIndex) => (
          <TableRow
            key={rowIndex}
            row={row}
            rowIndex={rowIndex}
            handleRowClick={handleRowClick}
            expandedRow={expandedRow}
            isClubView={category === "Club"}
          />
        ))}
      </div>
    </div>
  );
};

export default ResultsTable;
