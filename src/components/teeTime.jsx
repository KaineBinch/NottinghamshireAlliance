import { useState } from "react";
import { teeTimes } from "../constants/teeTimes";

const TeeTimesTable = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [clubQuery, setClubQuery] = useState("");

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const handleClubChange = (event) => {
    setClubQuery(event.target.value.toLowerCase());
  };

  const uniqueClubs = [
    ...new Set(
      teeTimes.flatMap((teeTime) => teeTime.names.map((player) => player.club))
    ),
  ];

  const filteredTeeTimesByName = teeTimes.filter((teeTime) =>
    teeTime.names.some((player) =>
      player.name.toLowerCase().includes(searchQuery)
    )
  );

  const filteredTeeTimesByClub = filteredTeeTimesByName.filter(
    (teeTime) =>
      !clubQuery ||
      teeTime.names.some((player) => player.club.toLowerCase() === clubQuery)
  );

  return (
    <div className="w-full">
      <div className="flex justify-between mb-4">
        {/* Search by Name */}
        <div className="w-1/2 pr-2">
          <input
            type="text"
            placeholder="Search for a name..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="p-2 border border-gray-400 w-full placeholder-gray-500 text-black h-12 bg-[#ffffff] drop-shadow rounded-none"
          />
        </div>

        {/* Dropdown for Club Filter */}
        <div className="w-1/2 pl-2">
          <select
            value={clubQuery}
            onChange={handleClubChange}
            className="p-2 border border-gray-400 w-full placeholder-gray-500 text-base h-12 bg-[#ffffff] drop-shadow rounded-none"
          >
            <option value="">Select a club...</option>
            {uniqueClubs.map((club, index) => (
              <option key={index} value={club.toLowerCase()}>
                {club}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tee Times Table */}
      <div className="grid md:grid-cols-2 grid-cols-1 gap-4 w-full drop-shadow-sm">
        {filteredTeeTimesByClub.map((teeTime, index) => (
          <div
            key={index}
            className="col-span-1 border border-gray-400 bg-[#D9D9D9] drop-shadow"
          >
            <div className="p-2 border-b border-gray-300 text-white bg-[#214A27]">
              <h2 className="text-lg font-semibold">{teeTime.time}</h2>
            </div>
            <div className="p-1">
              <div className="grid md:grid-cols-2 grid-cols-1">
                {teeTime.names.map((player, playerIndex) => (
                  <div key={playerIndex} className="p-2">
                    <p>
                      <span>{player.name}</span>
                      <span className="ml-2 text-sm text-gray-500">
                        {player.club}
                      </span>
                    </p>
                    {player.isSenior && (
                      <p className="text-sm text-red-500">Senior</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeeTimesTable;
