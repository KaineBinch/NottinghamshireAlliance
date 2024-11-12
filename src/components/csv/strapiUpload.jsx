// src/utils/strapiUpload.js
import axios from "axios";
import ExcelJS from "exceljs";

export const uploadToStrapi = async (csvData, fileName) => {
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
