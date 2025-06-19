import axios from "axios"
import { queryBuilder } from "../queryBuilder"
import { MODELS } from "../../constants/api"

export const createFixture = async (fixtureData) => {
  try {
    const url = queryBuilder(MODELS.events, "")

    const payload = {
      data: {
        eventDate: fixtureData.eventDate,
        eventType: fixtureData.eventType,
        eventReview: fixtureData.eventReview || null,
        // Connect to golf club using documentId if available
        ...(fixtureData.golfClubDocumentId ? {
          golf_club: fixtureData.golfClubDocumentId
        } : {})
      }
    }

    console.log('Creating fixture with payload:', payload)
    console.log('To URL:', url)

    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return response.data
  } catch (error) {
    console.error('Error creating fixture:', error)
    console.error('Response data:', error.response?.data)
    console.error('Response status:', error.response?.status)
    throw error
  }
}