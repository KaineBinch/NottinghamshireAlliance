const TeamScoresTable = ({ team, title, position }) => {
  const headerTitle = position
    ? `${position} Team - ${team.clubName} ${team.totalPoints} Points${
        team.usedTiebreaker ? ` (B9: ${team.totalBack9})` : ""
      }`
    : `${title} - ${team.clubName} ${team.totalPoints} Points${
        team.usedTiebreaker ? ` (B9: ${team.totalBack9})` : ""
      }`

  return (
    <div className="mb-5 h-full">
      <h3 className="text-[#214A27] font-bold text-sm mb-1">{headerTitle}</h3>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[#214A27] text-white">
            <th className="border border-gray-300 p-1">Golfer Name</th>
            <th className="border border-gray-300 p-1 text-center">
              Individual points
            </th>
          </tr>
        </thead>
        <tbody>
          {team.scores.map((score, index) => (
            <tr
              key={index}
              className={index % 2 === 0 ? "bg-[#d9d9d9]" : "bg-white"}>
              <td className="border border-gray-300 p-1">
                {score.golfer?.golferName || "Unknown Player"}
                {score.golfer?.isPro && (
                  <span className="text-blue-600 ml-1 text-xs font-medium">
                    (Pro)
                  </span>
                )}
              </td>
              <td className="border border-gray-300 p-1 text-center">
                {typeof score.golferEventScore === "number" ? (
                  <div className="flex items-center justify-center">
                    <span>{score.golferEventScore}</span>
                    {score.usedTiebreaker && (
                      <span
                        className="text-blue-700 ml-1 text-xs font-medium"
                        title={`Back 9: ${score.back9Score || 0}`}>
                        (B9: {score.back9Score || 0})
                      </span>
                    )}
                  </div>
                ) : (
                  "N/A"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TeamScoresTable
