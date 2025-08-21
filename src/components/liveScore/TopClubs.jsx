export const TopClubs = ({ top4Clubs, isRegularView = false }) => {
  if (!top4Clubs || top4Clubs.length === 0) return null

  if (isRegularView) {
    return (
      <div className="mb-5">
        <div className="bg-[#D9D9D9] rounded-lg p-3 border-b-2 border-[#214A27]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {top4Clubs.map((club, index) => (
              <div
                key={index}
                className="bg-white rounded-md p-2.5 shadow-sm text-center">
                <div className="flex items-center justify-center mb-1.5">
                  <span className="bg-[#214A27] text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    #{index + 1}
                  </span>
                </div>
                <h3 className="font-semibold text-sm text-gray-800 mb-1.5 line-clamp-2 leading-tight min-h-[2rem]">
                  {club.clubName}
                </h3>
                <div className="text-lg font-bold text-[#214A27] mb-1">
                  {club.teamTotal}
                </div>
                <div className="text-xs text-gray-600">
                  {club.playersWithScores}/{club.totalPlayers} completed
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // TV View - Ultra compact single line design
  return (
    <div className="bg-[#D9D9D9] px-8 py-3 border-b-2 border-[#214A27]">
      <div className="grid grid-cols-4 gap-3">
        {top4Clubs.map((club, index) => (
          <div
            key={index}
            className="bg-white rounded-lg px-3 py-2 shadow-sm text-center">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <span className="bg-[#214A27] text-white text-xs px-2 py-0.5 rounded-full font-bold">
                #{index + 1}
              </span>
              <span className="text-lg font-bold text-[#214A27]">
                {club.teamTotal}
              </span>
            </div>
            <h3 className="font-semibold text-sm text-gray-800 mb-1 line-clamp-1">
              {club.clubName}
            </h3>
            <div className="text-xs text-gray-600">
              {club.playersWithScores}/{club.totalPlayers} completed
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
