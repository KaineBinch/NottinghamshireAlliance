import axios from "axios"
import { queryBuilder } from "../queryBuilder"
import { MODELS } from "../../constants/api"

// Function to fetch all existing golfers for validation
export const getAllGolfers = async () => {
  try {
    const url = queryBuilder(MODELS.golfers, "?populate=golf_club")
    console.log('Fetching existing golfers from:', url)

    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return response.data.data || []
  } catch (error) {
    console.error('Error fetching golfers:', error)
    throw error
  }
}

// Function to fetch a single golfer by ID
export const getGolferById = async (golferId) => {
  try {
    // First try to get all golfers and find the specific one
    // This is more reliable with Strapi v5's documentId system
    const allGolfers = await getAllGolfers()
    console.log('Looking for golfer with ID:', golferId)
    console.log('Available golfers:', allGolfers.map(g => ({
      id: g.id,
      documentId: g.documentId,
      name: g.golferName
    })))

    const golfer = allGolfers.find(g =>
      g.id === golferId ||
      g.documentId === golferId ||
      g.id?.toString() === golferId?.toString() ||
      g.documentId?.toString() === golferId?.toString()
    )

    if (!golfer) {
      throw new Error(`Golfer with ID ${golferId} not found`)
    }

    console.log('Found golfer:', golfer)
    return golfer
  } catch (error) {
    console.error('Error fetching golfer by ID:', error)
    throw error
  }
}

// Function to validate if golfer data already exists (with exclusion for editing)
export const validateGolferData = async (golferData, excludeGolferId = null) => {
  try {
    const existingGolfers = await getAllGolfers()
    const conflicts = []

    console.log('Existing golfers data structure:', existingGolfers[0]) // Debug log

    // Check each field for duplicates
    existingGolfers.forEach(golfer => {
      // Skip validation for the golfer being edited - check multiple ID formats
      if (excludeGolferId && (
        golfer.id === excludeGolferId ||
        golfer.documentId === excludeGolferId ||
        golfer.id?.toString() === excludeGolferId?.toString() ||
        golfer.documentId?.toString() === excludeGolferId?.toString()
      )) {
        return
      }

      // Check golfer name (case-insensitive) - exact match only
      if (golfer.golferName &&
        golfer.golferName.toLowerCase().trim() === golferData.golferName.toLowerCase().trim()) {
        conflicts.push(`Golfer name "${golferData.golferName}" already exists`)
      }
    })

    return {
      isValid: conflicts.length === 0,
      conflicts: conflicts
    }
  } catch (error) {
    console.error('Error validating golfer data:', error)
    // If validation fails due to API error, allow creation but log the error
    return {
      isValid: true,
      conflicts: [],
      validationError: 'Could not validate against existing golfers due to API error'
    }
  }
}

// Function to check if golfer can be safely deleted
export const checkGolferDeletionSafety = async (golferId) => {
  try {
    const warnings = []
    const blockers = []

    // Get the actual golfer first to get proper ID
    const golfer = await getGolferById(golferId)
    const actualId = golfer.documentId || golfer.id

    console.log('Checking deletion safety for golfer:', {
      golferId,
      actualId,
      golferName: golfer.golferName
    })

    try {
      // Check for scores by this golfer
      let scores = []

      // Try documentId first
      try {
        const scoresUrl1 = queryBuilder(MODELS.scores, `?filters[golfer][documentId][$eq]=${actualId}`)
        console.log('Checking scores at URL (documentId):', scoresUrl1)
        const scoresResponse1 = await axios.get(scoresUrl1)
        scores = scoresResponse1.data.data || []
      } catch (error) {
        console.log('documentId filter failed, trying id filter:', error.message)
        // Try regular id as fallback
        const scoresUrl2 = queryBuilder(MODELS.scores, `?filters[golfer][id][$eq]=${actualId}`)
        console.log('Checking scores at URL (id):', scoresUrl2)
        const scoresResponse2 = await axios.get(scoresUrl2)
        scores = scoresResponse2.data.data || []
      }

      console.log('Found scores:', scores.length)

      if (scores.length > 0) {
        warnings.push(`This golfer has ${scores.length} score(s) associated with them`)
        blockers.push(`Cannot delete golfer with ${scores.length} recorded scores`)
      }
    } catch (error) {
      console.warn('Could not check scores for golfer:', error.message)
      warnings.push('Could not verify associated scores')
    }

    try {
      // Check for tee times for this golfer
      let teeTimes = []

      // Try documentId first
      try {
        const teeTimesUrl1 = queryBuilder("/tee-times", `?filters[golfers][documentId][$eq]=${actualId}`)
        console.log('Checking tee times at URL (documentId):', teeTimesUrl1)
        const teeTimesResponse1 = await axios.get(teeTimesUrl1)
        teeTimes = teeTimesResponse1.data.data || []
      } catch (error) {
        console.log('documentId filter failed for tee times, trying id filter:', error.message)
        // Try regular id as fallback
        const teeTimesUrl2 = queryBuilder("/tee-times", `?filters[golfers][id][$eq]=${actualId}`)
        console.log('Checking tee times at URL (id):', teeTimesUrl2)
        const teeTimesResponse2 = await axios.get(teeTimesUrl2)
        teeTimes = teeTimesResponse2.data.data || []
      }

      console.log('Found tee times:', teeTimes.length)

      if (teeTimes.length > 0) {
        warnings.push(`This golfer has ${teeTimes.length} tee time(s) associated with them`)
        // Note: We might want to allow deletion but warn about orphaned tee times
        // Or make it a blocker if tee times are critical
        // blockers.push(`Cannot delete golfer with ${teeTimes.length} associated tee times`)
      }
    } catch (error) {
      console.warn('Could not check tee times for golfer:', error.message)
      warnings.push('Could not verify associated tee times')
    }

    const result = {
      canDelete: blockers.length === 0,
      warnings: warnings,
      blockers: blockers
    }

    console.log('Final safety check result:', result)
    return result
  } catch (error) {
    console.error('Error checking golfer deletion safety:', error)
    return {
      canDelete: false,
      warnings: [],
      blockers: ['Unable to verify golfer relationships due to API error: ' + error.message]
    }
  }
}

export const createGolfer = async (golferData) => {
  try {
    // First validate the golfer data
    console.log('Validating golfer data before creation...')
    const validation = await validateGolferData(golferData)

    if (!validation.isValid) {
      const error = new Error('Golfer validation failed')
      error.validationErrors = validation.conflicts
      throw error
    }

    // If validation warns about API error, log it but continue
    if (validation.validationError) {
      console.warn('Validation warning:', validation.validationError)
    }

    const url = queryBuilder(MODELS.golfers, "")

    const payload = {
      data: {
        golferName: golferData.golferName,
        isPro: golferData.isPro || false,
        isSenior: golferData.isSenior || false,
        // Connect to golf club using documentId if available
        ...(golferData.golfClubDocumentId ? {
          golf_club: golferData.golfClubDocumentId
        } : {})
      }
    }

    console.log('Creating golfer with payload:', payload)
    console.log('To URL:', url)

    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return response.data
  } catch (error) {
    console.error('Error creating golfer:', error)
    console.error('Response data:', error.response?.data)
    console.error('Response status:', error.response?.status)
    throw error
  }
}

export const updateGolfer = async (golferId, golferData) => {
  try {
    // First validate the golfer data (excluding the golfer being edited)
    console.log('Validating golfer data before update...')
    const validation = await validateGolferData(golferData, golferId)

    if (!validation.isValid) {
      const error = new Error('Golfer validation failed')
      error.validationErrors = validation.conflicts
      throw error
    }

    // If validation warns about API error, log it but continue
    if (validation.validationError) {
      console.warn('Validation warning:', validation.validationError)
    }

    // First, get the golfer to find the correct documentId
    const golfer = await getGolferById(golferId)
    const actualId = golfer.documentId || golfer.id

    const url = queryBuilder(MODELS.golfers, `/${actualId}`)

    const payload = {
      data: {
        golferName: golferData.golferName,
        isPro: golferData.isPro || false,
        isSenior: golferData.isSenior || false,
        // Connect to golf club using documentId if available
        ...(golferData.golfClubDocumentId ? {
          golf_club: golferData.golfClubDocumentId
        } : {})
      }
    }

    console.log('Updating golfer with payload:', payload)
    console.log('To URL:', url)

    const response = await axios.put(url, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return response.data
  } catch (error) {
    console.error('Error updating golfer:', error)
    console.error('Response data:', error.response?.data)
    console.error('Response status:', error.response?.status)
    throw error
  }
}

export const deleteGolfer = async (golferId) => {
  try {
    // Check deletion safety first
    const safetyCheck = await checkGolferDeletionSafety(golferId)

    if (!safetyCheck.canDelete) {
      const error = new Error('Golfer cannot be deleted')
      error.blockers = safetyCheck.blockers
      error.warnings = safetyCheck.warnings
      throw error
    }

    // Get the golfer to find the correct documentId
    const golfer = await getGolferById(golferId)
    const actualId = golfer.documentId || golfer.id

    const url = queryBuilder(MODELS.golfers, `/${actualId}`)
    console.log('Deleting golfer from:', url)

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
    console.error('Error deleting golfer:', error)
    console.error('Response data:', error.response?.data)
    console.error('Response status:', error.response?.status)
    throw error
  }
}