
export const calculateTotalPoints = (result) => {
  if (!Array.isArray(result)) {
    console.error("Expected 'result' to be an array, but got:", result);
    return 0; // Return 0 if result is not an array
  }

  const sortedScores = result
    .map((item) => parseInt(item.score, 10))
    .sort((a, b) => b - a);
  return sortedScores.slice(0, 10).reduce((total, score) => total + score, 0);
};

export const transformResults = (results) => {
  const datesSet = new Set();
  results.forEach((player) => {
    player.result.forEach((item) => {
      datesSet.add(item.date);
    });
  });

  const columns = [
    { field: "name", headerName: "Name", width: "140px" },
    { field: "club", headerName: "Club", width: "70px" },
    { field: "total", headerName: "Total", width: "74px" },
    ...Array.from(datesSet).map((date) => ({
      field: date,
      headerName: date,
      width: "60px",
      type: "number",
    })),
  ];

  const rows = results.map((player, index) => {
    const row = {
      id: index + 1,
      name: player.name,
      club: player.club,
    };

    Array.from(datesSet).forEach((date) => {
      const scoreItem = player.result.find((item) => item.date === date);
      row[date] = scoreItem ? parseInt(scoreItem.score) : "-";
    });

    row.total = calculateTotalPoints(player.result);
    return row;
  });

  return { rows, columns };
};
