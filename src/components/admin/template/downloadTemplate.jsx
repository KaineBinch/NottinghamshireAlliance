import ExcelJS from "exceljs";

const DownloadTemplateButton = ({ eventDate, startTime, endTime }) => {
  const downloadTemplate = async () => {
    if (!eventDate || !startTime || !endTime) {
      alert("Please select an event date, start time, and end time.");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Event Template");

    const headerRow = [
      "Date",
      "Tee time",
      "Golfer Name",
      "Senior?",
      "Pro?",
      "Club",
      "Score",
    ];

    const header = worksheet.addRow(headerRow);
    header.height = 26.25;
    header.eachCell((cell) => {
      cell.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "214A27" },
      };
    });

    const columnWidths = [15, 15, 20, 10, 10, 15, 10];
    columnWidths.forEach((width, index) => {
      worksheet.getColumn(index + 1).width = width;
    });

    const teeTimes = [];
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    // Generate tee times within the specified range
    for (let hour = startHour; hour <= endHour; hour++) {
      for (
        let minute = hour === startHour ? startMinute : 0;
        minute < 60;
        minute += 10
      ) {
        // Stop adding times if the time goes beyond the end time
        if (hour === endHour && minute > endMinute) break;

        const time = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;

        // Adding 4 slots per tee time
        for (let i = 0; i < 4; i++) {
          teeTimes.push(time);
        }
      }
    }

    teeTimes.forEach((time) => {
      const [eventYear, eventMonth, eventDay] = eventDate
        .split("-")
        .map(Number);
      const [teeHour, teeMinute] = time.split(":").map(Number);
      const teeDatetime = new Date(
        eventYear,
        eventMonth - 1,
        eventDay,
        teeHour,
        teeMinute
      );

      worksheet.addRow([eventDate, teeDatetime, "", "", "", "", ""]);
    });

    // Set column formatting for the "Tee time" column
    worksheet.getColumn(2).numFmt = "hh:mm";

    // Alternating row colors
    const color1 = "00B050";
    const color2 = "B5E6A2";

    teeTimes.forEach((time, index) => {
      const rowIndex = index + 2;
      const minute = parseInt(time.split(":")[1], 10);
      const bgColor = minute % 20 === 0 ? color1 : color2;

      for (let colIndex = 1; colIndex <= 7; colIndex++) {
        const cell = worksheet.getCell(rowIndex, colIndex);

        // Set background color
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: bgColor },
        };

        // Set alignment and font based on column
        if (colIndex <= 2) {
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.font = {
            name: "Aptos Narrow",
            size: 12,
            bold: true,
          };
        } else {
          cell.font = { name: "Aptos Narrow", size: 12 };
        }

        // Set bottom border
        cell.border = {
          bottom: { style: "thin", color: { argb: "000000" } }, // Thin black bottom border
        };
      }
    });

    // Download logic
    await workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `event_template_${eventDate}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  return (
    <button
      onClick={downloadTemplate}
      className="bg-[#214A27] text-white p-3 mt-2 rounded-sm hover:bg-[#17331B] transition duration-300"
    >
      Download Event Template
    </button>
  );
};

export default DownloadTemplateButton;
