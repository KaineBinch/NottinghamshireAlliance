import React from "react"

const CSVPreview = ({ csvData, groupedData }) => {
  const times = Object.keys(groupedData)

  console.log("csvData in CSVPreview:", csvData)
  console.log("groupedData in CSVPreview:", groupedData)

  return (
    <div>
      <div className="flex flex-col space-y-4 bg-gray-100 p-6 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold text-center">CSV Preview</h2>
        <p className="my-6">
          Here you will find a preview of the file you just uploaded. <br />
          You can use this as a final check to ensure that everything is entered
          correctly.
        </p>
        <h2 className="text-lg font-semibold">
          {csvData && csvData.length > 1 && csvData[1] ? csvData[1][0] : ""}
        </h2>
        <div className="overflow-auto">
          <table className="min-w-full border-collapse border border-gray-300 mt-2">
            <thead>
              <tr>
                {csvData &&
                  csvData.length > 0 &&
                  csvData[0] &&
                  csvData[0].slice(2).map((header, index) => (
                    <th
                      key={index}
                      className="border border-gray-300 bg-gray-200 p-2 text-center">
                      {header}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {times.map((time) => (
                <React.Fragment key={time}>
                  <tr>
                    <td
                      className="pt-3 font-semibold"
                      colSpan={csvData[0].slice(2).length}>
                      {time.slice(0, -3)}
                    </td>
                  </tr>
                  {groupedData[time]?.map((row, j) => (
                    <tr
                      key={j}
                      className={
                        j % 2 === 0 ? "bg-white w-full" : "bg-gray-100 w-full"
                      }>
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="border border-gray-300 p-2">
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
    </div>
  )
}

export default CSVPreview
