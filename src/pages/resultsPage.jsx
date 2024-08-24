import { useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import PageHeader from "../components/pageHeader";
import { results } from "../constants/results";

const transformResults = (results) => {
  const datesSet = new Set();
  results.forEach((player) => {
    player.result.forEach((item) => {
      datesSet.add(item.date);
    });
  });

  const columns = [
    {
      field: "pos",
      headerName: "Pos",
      width: 66,
      headerClassName: "custom-header-cell",
      cellClassName: "custom-cell",
    },
    {
      field: "name",
      headerName: "Name",
      width: 140,
      headerClassName: "custom-header-cell",
      cellClassName: "custom-cell",
    },
    {
      field: "club",
      headerName: "Club",
      width: 70,
      headerClassName: "custom-header-cell",
      cellClassName: "custom-cell",
    },
    {
      field: "total",
      headerName: "Total",
      width: 74,
      headerClassName: "custom-header-cell",
      cellClassName: "custom-cell",
    },
    ...Array.from(datesSet).map((date) => ({
      field: date,
      headerName: date,
      width: 82,
      type: "number",
      headerClassName: "custom-header-cell",
      cellClassName: "custom-cell",
    })),
  ];

  let rows = results.map((player, index) => {
    const row = {
      id: index + 1,
      pos: index + 1,
      name: player.name,
      club: player.club,
    };
    let total = 0;
    player.result.forEach((item) => {
      row[item.date] = parseInt(item.score);
      total += parseInt(item.score);
    });
    row.total = total;
    return row;
  });

  rows.sort((a, b) => b.total - a.total);

  rows = rows.map((row, index) => ({
    ...row,
    pos: index + 1,
  }));

  return { rows, columns };
};

const ResultsPage = () => {
  const { rows, columns } = transformResults(results);
  const [searchTerm, setSearchTerm] = useState("");
  const [clubFilter, setClubFilter] = useState("");

  const clubOptions = [...new Set(results.map((player) => player.club))];

  const filteredRows = rows.filter(
    (row) =>
      row.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (clubFilter === "" || row.club.toLowerCase() === clubFilter.toLowerCase())
  );

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleClubFilterChange = (event) => {
    setClubFilter(event.target.value);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <PageHeader title="Results" />
      <div className="m-5">
        <div className="flex flex-col md:flex-row justify-between mb-3">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="p-2 border rounded-md mb-2 md:mb-0 md:mr-2 custom-select"
            style={{ maxWidth: "300px", width: "100%" }}
          />
          <select
            value={clubFilter}
            onChange={handleClubFilterChange}
            className="p-2 border rounded-md custom-select"
            style={{ maxWidth: "300px", width: "100%" }}
          >
            <option value="">Filter by club...</option>
            {clubOptions.map((club, index) => (
              <option key={index} value={club}>
                {club}
              </option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto bg-white rounded-lg shadow-md p-4">
          <div className="w-full md:w-auto">
            <DataGrid
              rows={filteredRows}
              columns={columns}
              pageSize={5}
              autoHeight
              disableColumnMenu
              headerClassName="custom-header-cell"
              cellClassName="custom-cell"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
