import React from "react";

const CSVPreview = ({ csvData, groupedData }) => {
  const times = Object.keys(groupedData);

  return (
    <div>
      <h2 className="text-xl font-semibold mt-6">{`${csvData[1][0]} Preview:`}</h2>
      <div className="overflow-auto">
        <table className="min-w-full border-collapse border border-gray-300 mt-2">
          <thead>
            <tr>
              {csvData[0].slice(2).map((header, index) => (
                <th
                  key={index}
                  className="border border-gray-300 bg-gray-200 p-2 text-left"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {times.map((time) => (
              <React.Fragment key={time}>
                <tr>
                  <td className="pt-3 font-semibold" colSpan="5">
                    {time.slice(0, -3)}
                  </td>
                </tr>
                {groupedData[time]?.map((row, j) => (
                  <tr
                    key={j}
                    className={
                      j % 2 === 0 ? "bg-white w-full" : "bg-gray-100 w-full"
                    }
                  >
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="border border-gray-300 p-2"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CSVPreview;
