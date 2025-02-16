import axios from "axios"
import { queryBuilder } from "../../../utils/queryBuilder"
import { MODELS, QUERIES } from "../../../constants/api"

export const uploadToStrapi = async (
  csvData,
  setUploadProgress,
  setUploadStatus,
  setUploadMessage
) => {
  const userConfirmed = window.confirm(
    "Are you sure you want to make these changes? Your changes cannot be undone."
  )
  if (!userConfirmed) {
    setUploadStatus("Cancelled")
    setUploadMessage("Upload cancelled by user. ❌")
    return
  }

  try {
    setUploadStatus("Uploading")
    setUploadMessage("Uploading...")

    const blob = csvData.map((row) => row.join(",")).join("\n")
    const body = { blob }

    const query = queryBuilder(MODELS.imports, QUERIES.csvImport)
    const response = await axios.post(query, body, {
      headers: { "Content-Type": "application/JSON" },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
        setUploadProgress(progress)
        setUploadMessage(`Uploading ${progress}%`)
      },
    })

    if (response.status === 200) {
      console.log("Upload successful ✅")
      setUploadStatus("Success! ✅")
      setUploadMessage("Upload Complete! 🎉")
      return response.data
    } else {
      setUploadStatus("❌ Error")
      setUploadMessage(`🚩 Upload failed with status: ${response.status}`)
      throw new Error(`🚩 Upload failed with status: ${response.status}`)
    }
  } catch (error) {
    console.error("🚩 Error uploading CSV to Strapi:", error)
    setUploadStatus("❌ Error")
    setUploadMessage(
      "🚩 Upload failed: " +
        (error.response?.data?.error?.message || error.message)
    )
  }
}
