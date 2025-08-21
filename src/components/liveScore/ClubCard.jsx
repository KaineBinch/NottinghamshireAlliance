import { PlayerTable } from "./PlayerTable"

export const ClubCard = ({ club, isRegularView = false }) => {
  // Calculate total score from top 4 players with scores (excluding NIT players)
  const getTeamTotal = () => {
    const playersWithScores = club.players.filter(
      (p) => p.hasScores && !p.isNIT
    )
    const top4Players = playersWithScores
      .sort((a, b) => (b.total || 0) - (a.total || 0))
      .slice(0, 4)

    return top4Players.reduce((sum, player) => sum + (player.total || 0), 0)
  }

  if (isRegularView) {
    return (
      <div className="mb-5">
        <h3 className="text-[#214A27] font-bold text-sm mb-1">
          {club.clubName}
          <span className="text-gray-600 font-normal text-xs ml-2">
            ({club.playersWithScores}/{club.totalPlayers} finished)
          </span>
        </h3>
        <PlayerTable club={club} isRegularView />
      </div>
    )
  }

  const teamTotal = getTeamTotal()

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200 hover:shadow-xl transition-all duration-300">
      <div className="bg-gradient-to-r from-[#214A27] via-[#2d5e34] to-[#17331B] text-white p-4">
        <h3 className="font-bold text-base lg:text-lg text-center mb-1">
          {club.clubName}
        </h3>
        <div className="flex items-center justify-center space-x-2 text-xs text-green-100">
          <span>
            {club.playersWithScores}/{club.totalPlayers} completed
          </span>
          {club.playersWithScores > 0 && (
            <>
              <span>•</span>
              <span>Team Total: {teamTotal}</span>
            </>
          )}
        </div>
      </div>
      <div className="p-3">
        <PlayerTable club={club} isRegularView={false} showTop4Divider={true} />
      </div>
    </div>
  )
}
