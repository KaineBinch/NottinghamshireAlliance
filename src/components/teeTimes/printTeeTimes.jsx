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
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 10px;
      color: #1f2937;
    }
    
    .event-type {
      font-size: 12px;
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
      font-size: 12px;
    }
    
    .time-cell {
      font-weight: bold;
      font-size: 12px;
      width: 15%;
    }
    
    .player-cell {
      width: 21.25%;
      word-wrap: break-word;
      line-height: 1.4;
    }
    
    .player-name {
      font-weight: bold;
      font-size: 12px;
      color: #1f2937;
    }
    
    .club-name {
      font-size: 10px;
      color: #1f2937;
      margin-top: 2px;
      font-weight: normal;
    }
    
    .status-senior {
      color: #dc2626;
      font-size: 10px;
      font-weight: bold;
    }
    
    .status-pro {
      color: #1d4ed8;
      font-size: 10px;
      font-weight: bold;
    }
    
    .empty-player {
      color: #9ca3af;
      font-style: italic;
      font-size: 10px;
    }
    
    .alternate-row {
      background-color: #fafafa;
    }
    
    @media print {
      body {
        padding: 10px;
        margin: 0;
        font-size: 11px !important; /* global downscale */
      }

      .event-header {
        margin-bottom: 10px !important;
      }

      .event-title {
        font-size: 13px !important;
        margin-bottom: 4px !important;
      }

      .event-type {
        font-size: 11px !important;
      }

      .tee-times-table th,
      .tee-times-table td {
        font-size: 11px !important;
        padding: 4px 2px !important; /* tighter cells */
      }

      .time-cell,
      .player-name {
        font-size: 11px !important;
      }

      .tee-times-table .time-cell {
        font-size: 14px !important
      } 

      .tee-times-table .player-cell {
        line-height: 1.1 !important; /* squeeze rows */
        padding: 9px 4px !important; /* override td padding, with more breathing room */
      }

      .tee-times-table .club-name {
        font-size: 9px !important;
        margin-top: 7px !important; /* remove extra spacing */
        line-height: 1 !important;
      }

      .club-name,
      .status-senior,
      .status-pro,
      .empty-player {
        font-size: 9px !important;
      }

      /* Table headers */
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
