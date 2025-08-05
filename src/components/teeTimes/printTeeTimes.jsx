import { Printer } from "lucide-react"

const PrintTeeTimesButton = ({ teeTimesData, eventDetails }) => {
  const handlePrint = () => {
    if (!teeTimesData || teeTimesData.length === 0) {
      alert("No tee times available to print.")
      return
    }

    const originalContent = document.body.innerHTML

    // Sort tee times
    const sortedTeeTimes = [...teeTimesData].sort((a, b) => {
      const timeA = a.golferTeeTime || "00:00"
      const timeB = b.golferTeeTime || "00:00"
      return timeA.localeCompare(timeB)
    })

    // Generate print content
    const printContent = `
      <div class="event-header">
        <div class="event-title">
          ${
            eventDetails?.title ||
            "Nottinghamshire Amateur & Professional Golfers' Alliance"
          }
        </div>
        ${
          eventDetails?.details
            ? `<div class="event-type">${eventDetails.details}</div>`
            : ""
        }
      </div>
      
      <table class="tee-times-table">
        <thead>
          <tr class="bg-[#214A27]">
            <th>Time</th>
            <th>Player 1</th>
            <th>Player 2</th>
            <th>Player 3</th>
            <th>Player 4</th>
          </tr>
        </thead>
        <tbody>
          ${sortedTeeTimes
            .map((teeTime, index) => {
              const time = teeTime.golferTeeTime || "No Time"
              let displayTime = time
              if (time !== "No Time" && time.includes(":")) {
                const [hours, minutes] = time.split(":")
                displayTime = `${hours}:${minutes}`
              }

              const players = teeTime.golfers || []
              const playerCells = []

              for (let i = 0; i < 4; i++) {
                if (players[i]) {
                  const player = players[i]
                  let playerName = player.golferName || "Unnamed Player"
                  const clubCode = player.golf_club?.clubName || ""

                  let cellContent = `<div class="player-name">${playerName}`

                  if (player.isSenior) {
                    cellContent += ` <span class="status-senior">(Senior)</span>`
                  }
                  if (player.isPro) {
                    cellContent += ` <span class="status-pro">(Pro)</span>`
                  }

                  cellContent += `</div>`

                  if (clubCode) {
                    cellContent += `<div class="club-name">${clubCode}</div>`
                  }

                  playerCells.push(
                    `<td class="player-cell">${cellContent}</td>`
                  )
                } else {
                  playerCells.push(
                    `<td class="player-cell empty-player">-</td>`
                  )
                }
              }

              return `
              <tr${index % 2 === 1 ? ' class="alternate-row"' : ""}>
                <td class="time-cell">${displayTime}</td>
                ${playerCells.join("")}
              </tr>
            `
            })
            .join("")}
        </tbody>
      </table>
    `

    const printStyles = `
      <style>
        body {
          font-family: Arial, sans-serif;
        }
        
        .event-header {
          margin-bottom: 30px;
          text-align: center;
        }
        
        .event-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #1f2937;
        }
        
        .event-type {
          font-size: 14px;
          font-weight: bold;
          color: #374151;
        }
        
        .tee-times-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
        }
        
        .tee-times-table th, 
        .tee-times-table td {
          border: 2px solid #d1d5db;
          padding: 12px 8px;
          text-align: center;
          vertical-align: middle;
        }
        
        .tee-times-table th {
          font-weight: bold;
          font-size: 14px;
        }
        
        .time-cell {
          font-weight: bold;
          font-size: 14px;
          width: 15%;
        }
        
        .player-cell {
          width: 21.25%;
          word-wrap: break-word;
          line-height: 1.4;
        }
        
        .player-name {
          font-weight: bold;
          font-size: 14px;
          color: #1f2937;
        }
        
        .club-name {
          font-size: 11px;
          color: #1f2937;
          margin-top: 2px;
          font-weight: normal;
        }
        
        .status-senior {
          color: #dc2626;
          font-size: 11px;
          font-weight: bold;
        }
        
        .status-pro {
          color: #1d4ed8;
          font-size: 11px;
          font-weight: bold;
        }
        
        .empty-player {
          color: #9ca3af;
          font-style: italic;
          font-size: 12px;
        }
        
        .alternate-row {
          background-color: #fafafa;
        }
        
        @media print {
          /* Table headers - uses your existing styling approach */
          th, tr.bg-\\[\\#214A27\\], .bg-\\[\\#214A27\\] {
            background-color: #e2e8f0 !important; /* gray-300 */
            color: black !important;
            font-weight: bold !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          @page {
            size: A4 portrait;
            margin: 0.5cm;
          }
          
          body {
            padding: 20px;
            margin: 0;
          }
          
          /* Prevent table rows from breaking across pages */
          .tee-times-table {
            page-break-inside: auto;
          }
          
          .tee-times-table tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          
          .tee-times-table thead {
            display: table-header-group;
          }
          
          .tee-times-table tbody {
            display: table-row-group;
          }
          
          /* Ensure table header repeats on each page */
          .tee-times-table thead tr {
            page-break-after: avoid;
          }
          
          .tee-times-table th, 
          .tee-times-table td {
            padding: 8px 4px !important;
            page-break-inside: avoid;
          }
          
          .alternate-row {
            background-color: #fafafa !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .status-senior {
            color: #dc2626 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .status-pro {
            color: #1d4ed8 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      </style>
    `

    document.body.innerHTML = printStyles + printContent
    window.print()
    document.body.innerHTML = originalContent
    window.location.reload()
  }

  return (
    <button
      onClick={handlePrint}
      className="bg-white border-2 border-gray-300 text-gray-800 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition duration-300 flex items-center gap-2 font-semibold -mt-4"
      title="Print Tee Times">
      <Printer size={20} />
      <span>Print Tee Times</span>
    </button>
  )
}

export default PrintTeeTimesButton
