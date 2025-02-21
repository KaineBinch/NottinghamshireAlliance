const ExpandedRowDetails = ({ result, isClubView }) => {
  if (isClubView) {
    // Club view logic - display top 4 players in the club
    return (
      <div className="p-4 bg-gray-50">
        <h3 className="font-bold mb-2">Top 4 Contributors</h3>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 text-left">Player</th>
              <th className="p-2 text-right">Score</th>
              <th className="p-2 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {result.slice(0, 4).map((player, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="p-2 text-left">{player.name}</td>
                <td className="p-2 text-right">{player.score}</td>
                <td className="p-2 text-left">{player.date}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold border-t border-gray-300">
              <td className="p-2 text-left">Total (Top 4)</td>
              <td className="p-2 text-right">
                {result
                  .slice(0, 4)
                  .reduce((sum, player) => sum + parseInt(player.score, 10), 0)}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    )
  } else {
    // Keep your existing individual player view code
    const sortedScores = result
      .map((item) => parseInt(item.score, 10))
      .sort((a, b) => b - a)
      .slice(0, 10)

    const highlightScores = [...sortedScores]

    return (
      <div className="p-4 bg-gray-50">
        <h3 className="font-bold mb-2">Individual Scores</h3>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            {result.map((res, index) => {
              const score = parseInt(res.score, 10)
              const isTopScore = highlightScores.includes(score)
              if (isTopScore) {
                highlightScores.splice(highlightScores.indexOf(score), 1)
              }
              return (
                <tr
                  key={index}
                  className={isTopScore ? "font-bold bg-gray-100" : ""}>
                  <td className="p-2 text-left">{res.date}</td>
                  <td className="p-2 text-right">{res.score}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }
}

export default ExpandedRowDetails
