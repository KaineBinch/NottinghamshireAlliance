import axios from "axios";
import { queryBuilder } from "../../../utils/queryBuilder";
import { MODELS, QUERIES } from "../../../constants/api";

export const uploadToStrapi = async (
  csvData,
  setUploadProgress,
  setUploadStatus,
  setUploadMessage
) => {
  try {
    setUploadStatus("uploading");
    setUploadMessage("Uploading...");

    const blob = csvData.map((row) => row.join(",")).join("\n");
    const body = { blob };
    console.log("body", body);

    const query = queryBuilder(MODELS.scores, QUERIES.csvImport);
    const response = await axios.post(query, body, {
      headers: { "Content-Type": "application/JSON" },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setUploadProgress(progress);
        setUploadMessage(`Uploading ${progress}%`);
      },
    });

    if (response.status === 200) {
      console.log("Upload successful");
      setUploadStatus("success");
      setUploadMessage("Upload Complete!");
      return response.data;
    } else {
      setUploadStatus("error");
      setUploadMessage(`Upload failed with status: ${response.status}`);
      throw new Error(`Upload failed with status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error uploading CSV to Strapi:", error);
    setUploadStatus("error");
    setUploadMessage(
      "Upload failed: " +
        (error.response?.data?.error?.message || error.message)
    );
  }
};
