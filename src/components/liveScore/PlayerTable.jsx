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

  // Separate regular players and NIT players
  const regularPlayers = club.players.filter((p) => !p.isNIT)
  const nitPlayers = club.players.filter((p) => p.isNIT)

  // Count regular players with scores to determine if we need a top 4 divider
  const regularPlayersWithScores = regularPlayers.filter(
    (p) => p.hasScores
  ).length

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
        {/* Regular players */}
        {regularPlayers.map((player, index) => {
          // Show divider after 4th regular player if conditions are met
          const showDividerAfter =
            showTop4Divider &&
            !isRegularView &&
            index === 3 &&
            regularPlayersWithScores >= 4

          return (
            <React.Fragment key={`regular-${player.name}-${index}`}>
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

        {/* Thicker separator for NIT players if they exist */}
        {nitPlayers.length > 0 && (
          <tr>
            <td colSpan="4" className="py-1">
              <div className="border-t border-gray-400"></div>
            </td>
          </tr>
        )}

        {/* NIT players */}
        {nitPlayers.map((player, index) => (
          <PlayerRow
            key={`nit-${player.name}-${index}`}
            player={player}
            index={regularPlayers.length + index} // Continue index from regular players
            isRegularView={isRegularView}
          />
        ))}

        {/* Empty state for regular view */}
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
