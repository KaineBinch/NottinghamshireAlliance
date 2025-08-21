import React from "react"
import { PlayerRow } from "./PlayerRow"

export const PlayerTable = ({
  club,
  isRegularView,
  showTop4Divider = false,
}) => {
  const tableClass = isRegularView ? "w-full border-collapse" : "w-full text-xs"
  const headerRowClass = isRegularView
    ? "bg-[#214A27] text-white"
    : "bg-slate-100 rounded"
  const headerCellClass = isRegularView
    ? "border border-gray-300 p-1 text-xs"
    : "text-left p-2 font-semibold text-slate-700"

  // Count players with scores to determine if we need a divider
  const playersWithScores = club.players.filter((p) => p.hasScores).length

  return (
    <table className={tableClass}>
      <thead>
        <tr className={headerRowClass}>
          <th className={headerCellClass}>Player</th>
          <th
            className={`${headerCellClass} text-center ${
              !isRegularView ? "w-10" : ""
            }`}>
            F9
          </th>
          <th
            className={`${headerCellClass} text-center ${
              !isRegularView ? "w-10" : ""
            }`}>
            B9
          </th>
          <th
            className={`${headerCellClass} text-center ${
              !isRegularView ? "w-12" : ""
            }`}>
            Total
          </th>
        </tr>
      </thead>
      <tbody>
        {club.players.map((player, index) => {
          // Show divider after 4th player if conditions are met
          const showDividerAfter =
            showTop4Divider &&
            !isRegularView &&
            index === 3 &&
            playersWithScores >= 4

          return (
            <React.Fragment key={`${player.name}-${index}`}>
              <PlayerRow
                player={player}
                index={index}
                isRegularView={isRegularView}
              />
              {showDividerAfter && (
                <tr>
                  <td colSpan="4" className="py-1">
                    <div className="border-t border-gray-300"></div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          )
        })}
        {club.players.length === 0 && isRegularView && (
          <tr className="bg-white">
            <td
              colSpan="4"
              className="border border-gray-300 p-2 text-center text-xs text-gray-500 italic">
              No players registered yet
            </td>
          </tr>
        )}
      </tbody>
    </table>
  )
}
