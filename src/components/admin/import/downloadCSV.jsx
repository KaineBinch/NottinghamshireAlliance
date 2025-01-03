import { useState } from "react";
import ExcelJS from "exceljs";
import FileUpload from "../import/fileUpload";
import ActionButtons from "../import/actionButtons";
import { uploadToStrapi } from "../import/uploadToStrapi";

const DownloadCSVFile = ({ csvData, setCsvData, setGroupedData }) => {
  const [fileName, setFileName] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
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

        const dataGroups = formattedData.slice(1).reduce((groups, row) => {
          const time = row[1];
          if (!groups[time]) groups[time] = [];
          if (row[2]) groups[time].push([...row.slice(2)]);
          return groups;
        }, {});
        setGroupedData(dataGroups);
      };

      reader.readAsArrayBuffer(file);
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

  const handleUploadToStrapi = async () => {
    try {
      await uploadToStrapi(
        csvData,
        setUploadProgress,
        setUploadStatus,
        setUploadMessage
      );
    } catch (error) {
      console.error("Error during upload:", error);
    }
  };

  return (
    <div className="flex flex-col space-y-4 bg-gray-100 h-full p-6 rounded-lg shadow-lg">
      <h2 className="text-lg font-semibold text-center mb-4">
        Import Your Excel File
      </h2>

      <FileUpload onFileUpload={handleFileUpload} />

      {fileName && (
        <div>
          <p className="text-gray-700 text-sm mb-2">
            Uploaded File: <strong>{fileName}</strong>
          </p>
          <ActionButtons
            onDownloadCSV={downloadCSV}
            onUploadToStrapi={handleUploadToStrapi}
          />
          {uploadStatus && (
            <div className="mt-4">
              <p>Status: {uploadStatus}</p>
              <p>Message: {uploadMessage}</p>
              {uploadStatus === "uploading" && (
                <p>Progress: {uploadProgress}%</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DownloadCSVFile;
