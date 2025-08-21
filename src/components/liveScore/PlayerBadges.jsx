export const PlayerBadges = ({ player, isRegularView }) => {
  if (isRegularView) {
    return (
      <div>
        {player.isNIT && <span className="golfer-nit-tag mr-1">NIT</span>}
        {player.name}
        {player.isPro && <span className="golfer-pro-tag">Pro</span>}
        {player.isSenior && <span className="golfer-senior-tag">Senior</span>}
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-1">
      {player.isNIT && (
        <span className="bg-orange-500 text-white text-xs px-1 rounded font-bold">
          NIT
        </span>
      )}
      <span className="truncate text-slate-700 font-medium">{player.name}</span>
      {player.isPro && (
        <span className="bg-blue-500 text-white text-xs px-1 rounded font-bold">
          P
        </span>
      )}
      {player.isSenior && (
        <span className="bg-red-500 text-white text-xs px-1 rounded font-bold">
          S
        </span>
      )}
    </div>
  )
}
