const IndividualWinnerTable = ({
  player,
  position,
  isNTP = false,
  isSenior = false,
}) => (
  <div className="mb-5">
    <h3 className="text-[#214A27] font-bold text-sm mb-1">
      {isNTP
        ? "NTP"
        : isSenior
        ? "Senior Winner"
        : `${position} Individual (not in Winning Teams)`}
    </h3>
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-[#214A27] text-white">
          <th className="border border-gray-300 p-1">Golfer Name</th>
          <th className="border border-gray-300 p-1">Club</th>
          <th className="border border-gray-300 p-1 text-center">Points</th>
        </tr>
      </thead>
      <tbody>
        <tr className="bg-[#d9d9d9]">
          <td className="border border-gray-300 p-1">
            {player.isNIT && (
              <span className="text-orange-600 ml-1 text-xs font-medium">
                NIT
              </span>
            )}
            {player.golfer?.golferName || "Unknown Player"}
          </td>
          <td className="border border-gray-300 p-1">
            {player.golfer?.golf_club?.clubName || "Unknown Club"}
          </td>
          <td className="border border-gray-300 p-1 text-center">
            {typeof player.golferEventScore === "number" ? (
              <div className="flex items-center justify-center">
                <span>{player.golferEventScore}</span>
                {player.usedTiebreaker && (
                  <span
                    className="text-blue-700 ml-1 text-xs font-medium"
                    title={`Back 9: ${player.back9Score || 0}`}>
                    (B9: {player.back9Score || 0})
                  </span>
                )}
              </div>
            ) : (
              player.specialScore || "N/A"
            )}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
)

export default IndividualWinnerTable
