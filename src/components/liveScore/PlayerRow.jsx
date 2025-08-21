import { PlayerBadges } from "./PlayerBadges"

export const PlayerRow = ({ player, index, isRegularView }) => {
  const rowClass = isRegularView
    ? index % 2 === 0
      ? "bg-[#d9d9d9]"
      : "bg-white"
    : `border-b border-slate-100 last:border-b-0 ${
        player.hasScores ? "bg-green-50/50" : "bg-slate-50/50"
      }`

  const cellClass = isRegularView ? "border border-gray-300 p-1" : "p-2"

  return (
    <tr className={rowClass}>
      <td
        className={`${cellClass} text-left text-base ${
          isRegularView ? "text-xs" : ""
        }`}>
        <PlayerBadges player={player} isRegularView={isRegularView} />
      </td>
      <td
        className={`${cellClass} text-center text-base ${
          isRegularView ? "text-sm" : "font-medium text-slate-600"
        }`}>
        {player.hasScores ? player.frontNine : isRegularView ? "-" : "—"}
      </td>
      <td
        className={`${cellClass} text-center text-base ${
          isRegularView ? "text-sm" : "font-medium text-slate-600"
        }`}>
        {player.hasScores ? player.backNine : isRegularView ? "-" : "—"}
      </td>
      <td
        className={`${cellClass} text-center text-base ${
          isRegularView ? "text-sm" : "font-medium text-slate-600"
        }`}>
        <span
          className={`font-bold text-base ${
            player.hasScores
              ? isRegularView
                ? ""
                : "text-emerald-700"
              : isRegularView
              ? ""
              : "text-slate-400"
          }`}>
          {player.hasScores ? player.total : isRegularView ? "-" : "—"}
        </span>
      </td>
    </tr>
  )
}
