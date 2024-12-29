import { teeTimes } from "../constants/teeTimes";
import { clubs } from "../constants/golfClubs";

const ListView = () => {
  const clubNameLookup = clubs.reduce((acc, club) => {
    acc[club.clubID] = club.name;
    return acc;
  }, {});

  const groupedByClub = teeTimes.reduce((acc, teeTime) => {
    teeTime.names.forEach((player) => {
      if (!acc[player.club]) {
        acc[player.club] = [];
      }
      acc[player.club].push({ name: player.name, time: teeTime.time });
    });
    return acc;
  }, {});

  Object.keys(groupedByClub).forEach((club) => {
    groupedByClub[club].sort((a, b) => a.name.localeCompare(b.name));
  });

  return (
    <div className="w-full flex justify-center">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl w-full">
        {Object.entries(groupedByClub).map(([clubID, players], index) => (
          <div
            key={index}
            className="border border-gray-400 shadow-md bg-[#d9d9d9]"
          >
            <div className="bg-[#214A27] text-white text-center p-4 ">
              <h3 className="text-xl font-semibold">
                {clubNameLookup[clubID] || clubID}
              </h3>
            </div>
            <div className="p-4">
              <ul>
                {players.map((player, playerIndex) => (
                  <li key={playerIndex} className="mb-2 text-gray-700">
                    {player.name} -{" "}
                    <span className="font-medium">{player.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListView;
