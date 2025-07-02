import axios from "axios"
import { queryBuilder } from "../queryBuilder"
import { MODELS } from "../../constants/api"

// Function to fetch all existing scores for validation
export const getAllScores = async () => {
  try {
    const url = queryBuilder(MODELS.scores, "?populate[0]=golfer&populate[1]=golfer.golf_club&populate[2]=event&populate[3]=event.golf_club")
    console.log('Fetching existing scores from:', url)

    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return response.data.data || []
  } catch (error) {
    console.error('Error fetching scores:', error)
    throw error
  }
}

// Function to fetch a single score by ID
export const getScoreById = async (scoreId) => {
  try {
    // First try to get all scores and find the specific one
    // This is more reliable with Strapi v5's documentId system
    const allScores = await getAllScores()
    console.log('Looking for score with ID:', scoreId)
    console.log('Available scores:', allScores.map(s => ({
      id: s.id,
      documentId: s.documentId,
      golferName: s.golfer?.golferName,
      eventType: s.event?.eventType
    })))

    const score = allScores.find(s =>
      s.id === scoreId ||
      s.documentId === scoreId ||
      s.id?.toString() === scoreId?.toString() ||
      s.documentId?.toString() === scoreId?.toString()
    )

    if (!score) {
      throw new Error(`Score with ID ${scoreId} not found`)
    }

    console.log('Found score:', score)
    return score
  } catch (error) {
    console.error('Error fetching score by ID:', error)
    throw error
  }
}

// Function to validate if score data already exists (with exclusion for editing)
export const validateScoreData = async (scoreData, excludeScoreId = null) => {
  try {
    const existingScores = await getAllScores()
    const conflicts = []

    console.log('Existing scores data structure:', existingScores[0]) // Debug log

    // Check for duplicate scores (same golfer + same event)
    existingScores.forEach(score => {
      // Skip validation for the score being edited - check multiple ID formats
      if (excludeScoreId && (
        score.id === excludeScoreId ||
        score.documentId === excludeScoreId ||
        score.id?.toString() === excludeScoreId?.toString() ||
        score.documentId?.toString() === excludeScoreId?.toString()
      )) {
        return
      }

      // Check for same golfer + same event (potential duplicate)
      if (score.golfer?.documentId === scoreData.golferDocumentId &&
        score.event?.documentId === scoreData.eventDocumentId) {
        const golferName = score.golfer?.golferName || 'Unknown golfer'
        const eventType = score.event?.eventType || 'Unknown event'
        conflicts.push(`A score already exists for ${golferName} in ${eventType}`)
      }
    })

    return {
      isValid: conflicts.length === 0,
      conflicts: conflicts
    }
  } catch (error) {
    console.error('Error validating score data:', error)
    // If validation fails due to API error, allow creation but log the error
    return {
      isValid: true,
      conflicts: [],
      validationError: 'Could not validate against existing scores due to API error'
    }
  }
}

// Function to check if score can be safely deleted
export const checkScoreDeletionSafety = async (scoreId) => {
  try {
    const warnings = []
    const blockers = []

    // Get the actual score first to get proper ID
    const score = await getScoreById(scoreId)
    const actualId = score.documentId || score.id

    console.log('Checking deletion safety for score:', {
      scoreId,
      actualId,
      golferName: score.golfer?.golferName,
      eventType: score.event?.eventType
    })

    // For scores, there might not be many dependencies to check
    // but we could check if this score is part of any competitions or rankings

    // Note: Most scores can typically be deleted safely
    // Add specific business logic here if needed

    const result = {
      canDelete: blockers.length === 0,
      warnings: warnings,
      blockers: blockers
    }

    console.log('Final safety check result:', result)
    return result
  } catch (error) {
    console.error('Error checking score deletion safety:', error)
    return {
      canDelete: false,
      warnings: [],
      blockers: ['Unable to verify score relationships due to API error: ' + error.message]
    }
  }
}

export const createScore = async (scoreData) => {
  try {
    // First validate the score data
    console.log('Validating score data before creation...')
    const validation = await validateScoreData(scoreData)

    if (!validation.isValid) {
      const error = new Error('Score validation failed')
      error.validationErrors = validation.conflicts
      throw error
    }

    // If validation warns about API error, log it but continue
    if (validation.validationError) {
      console.warn('Validation warning:', validation.validationError)
    }

    const url = queryBuilder(MODELS.scores, "")

    const payload = {
      data: {
        golferEventScore: scoreData.golferEventScore,
        front9Score: scoreData.front9Score || null,
        back9Score: scoreData.back9Score || null,
        // Connect to golfer and event using documentIds if available
        ...(scoreData.golferDocumentId ? {
          golfer: scoreData.golferDocumentId
        } : {}),
        ...(scoreData.eventDocumentId ? {
          event: scoreData.eventDocumentId
        } : {})
      }
    }

    console.log('Creating score with payload:', payload)
    console.log('To URL:', url)

    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return response.data
  } catch (error) {
    console.error('Error creating score:', error)
    console.error('Response data:', error.response?.data)
    console.error('Response status:', error.response?.status)
    throw error
  }
}

export const updateScore = async (scoreId, scoreData) => {
  try {
    // First validate the score data (excluding the score being edited)
    console.log('Validating score data before update...')
    const validation = await validateScoreData(scoreData, scoreId)

    if (!validation.isValid) {
      const error = new Error('Score validation failed')
      error.validationErrors = validation.conflicts
      throw error
    }

    // If validation warns about API error, log it but continue
    if (validation.validationError) {
      console.warn('Validation warning:', validation.validationError)
    }

    // First, get the score to find the correct documentId
    const score = await getScoreById(scoreId)
    const actualId = score.documentId || score.id

    const url = queryBuilder(MODELS.scores, `/${actualId}`)

    const payload = {
      data: {
        golferEventScore: scoreData.golferEventScore,
        front9Score: scoreData.front9Score || null,
        back9Score: scoreData.back9Score || null,
        // Connect to golfer and event using documentIds if available
        ...(scoreData.golferDocumentId ? {
          golfer: scoreData.golferDocumentId
        } : {}),
        ...(scoreData.eventDocumentId ? {
          event: scoreData.eventDocumentId
        } : {})
      }
    }

    console.log('Updating score with payload:', payload)
    console.log('To URL:', url)

    const response = await axios.put(url, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return response.data
  } catch (error) {
    console.error('Error updating score:', error)
    console.error('Response data:', error.response?.data)
    console.error('Response status:', error.response?.status)
    throw error
  }
}

export const deleteScore = async (scoreId) => {
  try {
    // Check deletion safety first
    const safetyCheck = await checkScoreDeletionSafety(scoreId)

    if (!safetyCheck.canDelete) {
      const error = new Error('Score cannot be deleted')
      error.blockers = safetyCheck.blockers
      error.warnings = safetyCheck.warnings
      throw error
    }

    // Get the score to find the correct documentId
    const score = await getScoreById(scoreId)
    const actualId = score.documentId || score.id

    const url = queryBuilder(MODELS.scores, `/${actualId}`)
    console.log('Deleting score from:', url)

    const response = await axios.delete(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return {
      success: true,
      warnings: safetyCheck.warnings,
      data: response.data
    }
  } catch (error) {
    console.error('Error deleting score:', error)
    console.error('Response data:', error.response?.data)
    console.error('Response status:', error.response?.status)
    throw error
  }
}