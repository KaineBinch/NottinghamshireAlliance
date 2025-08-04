import ExcelJS from "exceljs"

const DownloadTemplateButton = ({
  selectedEvent,
  startTime,
  endTime,
  minuteIncrement,
}) => {
  const downloadTemplate = async () => {
    if (!selectedEvent || !startTime || !endTime || !minuteIncrement) {
      alert("Please select an event date, start time, end time, and interval.")
      return
    }

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Event Template")

    const headerRow = [
      "Date",
      "Tee time",
      "Golfer Name",
      "Senior?",
      "Pro?",
      "Club",
      "Front 9",
      "Back 9",
      "Overall Score",
    ]

    const header = worksheet.addRow(headerRow)
    header.height = 34.5
    header.eachCell((cell, colIndex) => {
      cell.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } }
      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      }
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "214A27" },
      }
      cell.protection = {
        locked: colIndex <= 2,
      }
    })

    const columnWidths = [15, 15, 20, 10, 10, 10, 10, 10, 10]
    columnWidths.forEach((width, index) => {
      worksheet.getColumn(index + 1).width = width
    })

    worksheet.getColumn(1).hidden = true

    worksheet.views = [{ state: "frozen", ySplit: 1 }]

    const teeTimes = []
    const [startHour, startMinute] = startTime.split(":").map(Number)
    const [endHour, endMinute] = endTime.split(":").map(Number)

    let currentHour = startHour
    let currentMinute = startMinute

    while (
      currentHour < endHour ||
      (currentHour === endHour && currentMinute <= endMinute)
    ) {
      const time = `${currentHour.toString().padStart(2, "0")}:${currentMinute
        .toString()
        .padStart(2, "0")}`

      for (let i = 0; i < 4; i++) {
        teeTimes.push(time)
      }

      currentMinute += minuteIncrement
      if (currentMinute >= 60) {
        currentMinute -= 60
        currentHour++
      }
    }

    teeTimes.forEach((time) => {
      const [eventYear, eventMonth, eventDay] = selectedEvent.date
        .split("-")
        .map(Number)
      const [teeHour, teeMinute] = time.split(":").map(Number)
      const teeDatetime = new Date(
        Date.UTC(eventYear, eventMonth - 1, eventDay, teeHour, teeMinute)
      )

      worksheet.addRow([selectedEvent.date, teeDatetime, "", "", "", "", ""])
    })

    worksheet.getColumn(2).numFmt = "hh:mm"

    const color1 = "00B050"
    const color2 = "B5E6A2"

    teeTimes.forEach((time, index) => {
      const rowIndex = index + 2
      const minute = parseInt(time.split(":")[1], 10)
      const bgColor = minute % (2 * minuteIncrement) === 0 ? color1 : color2

      for (let colIndex = 1; colIndex <= 9; colIndex++) {
        const cell = worksheet.getCell(rowIndex, colIndex)

        cell.protection = {
          locked: colIndex <= 2,
        }

        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: bgColor },
        }

        if (colIndex <= 2) {
          cell.alignment = { horizontal: "center", vertical: "middle" }
          cell.font = {
            name: "Aptos Narrow",
            size: 12,
            bold: true,
          }
        } else {
          cell.font = { name: "Aptos Narrow", size: 12 }
        }

        cell.border = {
          bottom: { style: "thin", color: { argb: "000000" } },
        }

        if (colIndex === 9) {
          cell.border.right = { style: "thin", color: { argb: "000000" } }
        }
      }
    })

    worksheet.getCell(1, 9).border = {
      right: { style: "thin", color: { argb: "000000" } },
    }

    await worksheet.protect(`${import.meta.env.VITE_SPREADSHEET_PASS}`, {
      selectLockedCells: true,
      selectUnlockedCells: true,
      formatCells: false,
      formatColumns: false,
      formatRows: false,
      insertColumns: false,
      insertRows: false,
      insertHyperlinks: false,
      deleteColumns: false,
      deleteRows: false,
      sort: false,
      autoFilter: false,
      pivotTables: false,
    })

    await workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url

      // Create filename using event name instead of generic template name
      const cleanEventName = selectedEvent.eventName.replace(
        /[^a-zA-Z0-9]/g,
        "_"
      )
      a.download = `${cleanEventName}_${selectedEvent.date}.xlsx`

      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    })
  }

  return (
    <button
      onClick={downloadTemplate}
      className="bg-[#214A27] text-white p-3 mt-2 rounded-sm hover:bg-green-600 transition duration-300">
      Download Event Template
    </button>
  )
}

export default DownloadTemplateButton
