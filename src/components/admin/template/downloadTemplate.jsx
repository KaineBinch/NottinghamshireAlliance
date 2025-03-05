import ExcelJS from "exceljs"

const DownloadTemplateButton = ({
  eventDate,
  startTime,
  endTime,
  minuteIncrement,
}) => {
  const downloadTemplate = async () => {
    if (!eventDate || !startTime || !endTime || !minuteIncrement) {
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
      "Score",
    ]

    const header = worksheet.addRow(headerRow)
    header.height = 26.25
    header.eachCell((cell) => {
      cell.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } }
      cell.alignment = { horizontal: "center", vertical: "middle" }
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "214A27" },
      }
    })

    const columnWidths = [15, 15, 20, 10, 10, 15, 10]
    columnWidths.forEach((width, index) => {
      worksheet.getColumn(index + 1).width = width
    })

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
      const [eventYear, eventMonth, eventDay] = eventDate.split("-").map(Number)
      const [teeHour, teeMinute] = time.split(":").map(Number)
      const teeDatetime = new Date(
        Date.UTC(eventYear, eventMonth - 1, eventDay, teeHour, teeMinute)
      )

      worksheet.addRow([eventDate, teeDatetime, "", "", "", "", ""])
    })

    worksheet.getColumn(2).numFmt = "hh:mm"

    const color1 = "00B050"
    const color2 = "B5E6A2"

    teeTimes.forEach((time, index) => {
      const rowIndex = index + 2
      const minute = parseInt(time.split(":")[1], 10)
      const bgColor = minute % (2 * minuteIncrement) === 0 ? color1 : color2

      for (let colIndex = 1; colIndex <= 7; colIndex++) {
        const cell = worksheet.getCell(rowIndex, colIndex)

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
          bottom: { style: "thin", color: { argb: "000000" } }, //
        }
      }
    })

    await workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `event_template_${eventDate}.xlsx`
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
