const ProfessionalsTable = ({ scores }) => {
  const scoreGroups = {}
  scores.forEach((score) => {
    const eventScore = score.golferEventScore || 0
    if (!scoreGroups[eventScore]) {
      scoreGroups[eventScore] = []
    }
    scoreGroups[eventScore].push(score)
  })

  const sortedScores = Object.keys(scoreGroups)
    .map(Number)
    .sort((a, b) => b - a)

  let currentPosition = 1
  const proRows = []
  let displayedCount = 0

  sortedScores.forEach((score) => {
    const playersWithScore = scoreGroups[score]

    playersWithScore.sort((a, b) => (b.back9Score || 0) - (a.back9Score || 0))

    const shouldInclude = displayedCount < 5 || currentPosition <= 5

    if (shouldInclude) {
      playersWithScore.forEach((player) => {
        proRows.push({
          position: currentPosition,
          player: player,
          club: player.golfer?.golf_club?.clubName || "Unknown Club",
          score: player.golferEventScore || 0,
          back9: player.back9Score || 0,
          usedTiebreaker: player.usedTiebreaker,
        })
        displayedCount++
      })
    }

    currentPosition += playersWithScore.length
  })

  return (
    <div className="mb-5">
      <h3 className="text-[#214A27] font-bold text-sm mb-1">
        PGA Professionals / Assistants
      </h3>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[#214A27] text-white">
            <th className="border border-gray-300 p-1 text-center">Position</th>
            <th className="border border-gray-300 p-1">Golfer Name</th>
            <th className="border border-gray-300 p-1">Club</th>
            <th className="border border-gray-300 p-1 text-center">Points</th>
          </tr>
        </thead>
        <tbody>
          {proRows.map((row, index) => (
            <tr
              key={index}
              className={index % 2 === 0 ? "bg-[#d9d9d9]" : "bg-white"}>
              <td className="border border-gray-300 p-1 text-center">
                {row.position}
              </td>
              <td className="border border-gray-300 p-1">
                {row.player.golfer?.golferName || "Unknown"}
                {row.player.isNIT && (
                  <span className="text-orange-600 ml-1 text-xs font-medium">
                    (NIT)
                  </span>
                )}
              </td>
              <td className="border border-gray-300 p-1">{row.club}</td>
              <td className="border border-gray-300 p-1 text-center">
                <div className="flex items-center justify-center">
                  <span>{row.score}</span>
                  {row.usedTiebreaker && (
                    <span
                      className="text-blue-700 ml-1 text-xs font-medium"
                      title={`Back 9: ${row.back9}`}>
                      (B9: {row.back9})
                    </span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ProfessionalsTable
