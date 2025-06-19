import axios from "axios"
import { queryBuilder } from "../queryBuilder"
import { MODELS } from "../../constants/api"

export const createGolfClub = async (clubData) => {
  try {
    const url = queryBuilder(MODELS.golfClubs, "")

    // For now, let's use the same working pattern as fixtures (JSON only)
    const payload = {
      data: {
        clubName: clubData.clubName,
        clubAddress: clubData.clubAddress,
        clubURL: clubData.clubURL || null,
        clubContactNumber: clubData.clubContactNumber || null,
        clubID: clubData.clubID || null,
        proName: clubData.proName || null,
      }
    }

    console.log('Sending JSON payload:', payload)
    console.log('To URL:', url)

    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return response.data
  } catch (error) {
    console.error('Error creating golf club:', error)
    console.error('Response data:', error.response?.data)
    console.error('Response status:', error.response?.status)
    throw error
  }
}