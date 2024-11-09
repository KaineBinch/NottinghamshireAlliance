import { useState, useEffect } from "react";
import TableHeader from "../components/resultsTable/tableHeader"; // Import TableHeader for consistent styling
import TableRow from "../components/resultsTable/tableRow"; // Import TableRow for consistent styling

const EventScoresTable = ({ eventName, results }) => {
  const [eventScores, setEventScores] = useState([]);

  // Fetch event scores whenever results or eventName changes
  useEffect(() => {
    const filteredScores = results
      .filter((result) => result.event === eventName)
      .map((result) => ({
        name: result.name,
        score: parseInt(result.score, 10),
        club: result.club,
        result: result.result, // Include the result for expanded view if needed
      }));

    // Sort scores in descending order
    const sortedScores = filteredScores.sort((a, b) => b.score - a.score);
    setEventScores(sortedScores);
  }, [eventName, results]);

  return (
    <div className="flex flex-col justify-center my-8">
      <h2 className="font-semibold text-lg p-2">Scores for {eventName}</h2>
      <div className="bg-white shadow-md w-full max-w-5xl">
        <TableHeader onCategoryChange={() => {}} category="Event" />
        {eventScores.map((row, rowIndex) => (
          <TableRow
            key={rowIndex}
            row={row}
            rowIndex={rowIndex} // Row index for consistent rendering
            handleRowClick={() => {}} // Implement any click handling if necessary
            expandedRow={null} // Since we are not expanding in this table, pass null
            isClubView={false} // Since this is for an event, we don't need club view
          />
        ))}
      </div>
    </div>
  );
};

export default EventScoresTable;
