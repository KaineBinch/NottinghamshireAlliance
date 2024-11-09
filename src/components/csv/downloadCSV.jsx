import { useState, useEffect } from "react";
import axios from "axios";
import ExcelJS from "exceljs";
import FileUpload from "../csv/fileUpload";
import ActionButtons from "../csv/actionButtons";
import CSVPreview from "../csv/csvPreview";

const DownloadCSVFile = () => {
  const [csvData, setCsvData] = useState([]);
  const [fileName, setFileName] = useState("");
  const [groupedData, setGroupedData] = useState({});

  useEffect(() => {
    const dataGroups = csvData.slice(1).reduce((groups, row) => {
      const time = row[1];
      if (!groups[time]) groups[time] = [];
      if (row[2]) groups[time].push([...row.slice(2)]);
      return groups;
    }, {});
    setGroupedData(dataGroups);
  }, [csvData]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = async (e) => {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(e.target.result);
      const worksheet = workbook.getWorksheet(1);
      const jsonData = [];

      worksheet.eachRow((row) => {
        const rowValues = row.values.slice(1);
        jsonData.push(rowValues);
      });

      const formattedData = jsonData.map((row, rowIndex) => {
        if (rowIndex === 0) return row.slice(0, 7);
        return row.slice(0, 7).map((cell, cellIndex) => {
          if (cellIndex === 0) {
            return cell ? new Date(cell).toLocaleDateString("en-GB") : "";
          }
          if (cellIndex === 1) {
            return cell ? new Date(cell).toLocaleTimeString("en-GB") : "";
          }
          return cell;
        });
      });

      setCsvData(formattedData);
    };

    if (file) {
      reader.readAsArrayBuffer(file);
    }
  };

  const uploadToStrapi = async () => {
    try {
      const worksheet = ExcelJS.utils.json_to_sheet(csvData);
      const csv = ExcelJS.utils.sheet_to_csv(worksheet);
      const blob = new Blob([csv], { type: "text/csv" });
      const formData = new FormData();
      formData.append(
        "files",
        blob,
        `${fileName.split(".").slice(0, -1).join(".")}.csv`
      );

      await axios.post("http://localhost:1337/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Upload successful");
    } catch (error) {
      console.error("Error uploading CSV to Strapi:", error);
    }
  };

  const downloadCSV = () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("CSV Data");

    csvData.forEach((row) => worksheet.addRow(row));

    workbook.csv.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName
        .split(".")
        .slice(0, -1)
        .join(".")}-CSV-Conversion.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div>
      <FileUpload onFileUpload={handleFileUpload} />
      {fileName && (
        <p className="text-gray-700 mb-2">
          Uploaded File: <strong>{fileName}</strong>
        </p>
      )}
      {csvData.length > 0 && (
        <>
          <ActionButtons
            onDownloadCSV={downloadCSV}
            onUploadToStrapi={uploadToStrapi}
          />
          <CSVPreview csvData={csvData} groupedData={groupedData} />
        </>
      )}
    </div>
  );
};

export default DownloadCSVFile;
