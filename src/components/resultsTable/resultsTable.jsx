import { useState, useCallback, useEffect } from "react";
import { results } from "../../constants/results";
import { calculateTotalPoints } from "../../utils/transformResults";
import TableHeader from "../resultsTable/tableHeader";
import TableRow from "../resultsTable/tableRow";
import SearchFilter from "../SearchFilter";

const ResultsTable = ({ limit }) => {
  const [expandedRow, setExpandedRow] = useState(null);
  const [category, setCategory] = useState("Amateur");
  const [rankedResults, setRankedResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);

  const uniqueClubs = [...new Set(results.map((row) => row.club))];

  const categorizeData = useCallback(() => {
    let categorizedData = [];

    if (category === "Professional") {
      categorizedData = results.filter((row) => row.isPro);
    } else if (category === "Senior") {
      categorizedData = results.filter((row) => row.isSenior);
    } else if (category === "Amateur") {
      categorizedData = results.filter((row) => !row.isPro);
    } else if (category === "Club") {
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

      categorizedData = Object.values(clubMap).map(
        ({ club, totalPoints, players }) => ({
          name: club,
          totalPoints,
          result: players.flatMap((player) => player.result),
          players,
        })
      );
    }

    return categorizedData;
  }, [category]);

  const sortAndRankData = useCallback((data) => {
    const sortedData = data
      .map((row) => ({
        ...row,
        totalPoints: row.totalPoints || calculateTotalPoints(row.result),
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints);

    return sortedData.map((row, index) => ({
      ...row,
      rank: index + 1,
    }));
  }, []);

  useEffect(() => {
    const categorizedData = categorizeData();
    const rankedData = sortAndRankData(categorizedData);
    setRankedResults(rankedData);
    setFilteredResults(rankedData);
  }, [categorizeData, sortAndRankData]);

  const handleFilteredDataChange = (data) => {
    setFilteredResults(data);
  };

  const displayedResults = limit
    ? filteredResults.slice(0, limit)
    : filteredResults;

  return (
    <div className="flex flex-col justify-center my-8">
      <SearchFilter
        data={rankedResults}
        onFilteredDataChange={handleFilteredDataChange}
        uniqueClubs={uniqueClubs}
      />
      <div className="bg-white shadow-md w-full max-w-5xl border border-gray-400">
        <TableHeader onCategoryChange={setCategory} category={category} />
        {displayedResults.map((row, rowIndex) => (
          <TableRow
            key={rowIndex}
            row={row}
            rowIndex={row.rank - 1}
            handleRowClick={() =>
              setExpandedRow(expandedRow === rowIndex ? null : rowIndex)
            }
            expandedRow={expandedRow}
            isClubView={category === "Club"}
          />
        ))}
      </div>
    </div>
  );
};

export default ResultsTable;
