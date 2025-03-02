import axios from "axios"
import { queryBuilder } from "../../../utils/queryBuilder"
import { MODELS, QUERIES } from "../../../constants/api"

export const uploadToStrapi = async (
  csvData,
  setUploadProgress,
  setUploadStatus,
  setUploadMessage,
  token // Changed from getToken to token - now expects the actual token string
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
    setUploadMessage(
      <div className="flex items-center justify-center w-full">
        Processing...
        <div className="ml-2 w-4 h-4 border-2 border-t-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    )

    // Remove this line - token is now passed directly
    // const token = await getToken()

    console.log("Token first 20 chars:", token.substring(0, 20) + "...")
    if (!token.includes(".") || token.split(".").length !== 3) {
      console.error("Token is not in valid JWT format")
    }

    const blob = csvData.map((row) => row.join(",")).join("\n")
    const body = { blob }

    const query = queryBuilder(MODELS.imports, QUERIES.csvImport)
    const response = await axios.post(query, body, {
      headers: {
        "Content-Type": "application/JSON",
        Authorization: `Bearer ${token}`,
      },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
        setUploadProgress(progress)
        setUploadMessage(
          <div className="flex items-center justify-center w-full">
            Processing... <div className="spinner"></div>
          </div>
        )
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
