import axios from "axios"
import { queryBuilder } from "../queryBuilder"
import { MODELS } from "../../constants/api"

// Add missing models for related entities
const GOLFERS_MODEL = "/golfers"
const SCORES_MODEL = "/scores"
const TEE_TIMES_MODEL = "/tee-times"

// Function to fetch all existing fixtures for validation
export const getAllFixtures = async () => {
  try {
    const url = queryBuilder(MODELS.events, "?populate=golf_club")
    console.log('Fetching existing fixtures from:', url)

    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return response.data.data || []
  } catch (error) {
    console.error('Error fetching fixtures:', error)
    throw error
  }
}

// Function to fetch a single fixture by ID
export const getFixtureById = async (fixtureId) => {
  try {
    // First try to get all fixtures and find the specific one
    // This is more reliable with Strapi v5's documentId system
    const allFixtures = await getAllFixtures()
    console.log('Looking for fixture with ID:', fixtureId)
    console.log('Available fixtures:', allFixtures.map(f => ({
      id: f.id,
      documentId: f.documentId,
      eventType: f.eventType,
      eventDate: f.eventDate
    })))

    const fixture = allFixtures.find(f =>
      f.id === fixtureId ||
      f.documentId === fixtureId ||
      f.id?.toString() === fixtureId?.toString() ||
      f.documentId?.toString() === fixtureId?.toString()
    )

    if (!fixture) {
      throw new Error(`Fixture with ID ${fixtureId} not found`)
    }

    console.log('Found fixture:', fixture)
    return fixture
  } catch (error) {
    console.error('Error fetching fixture by ID:', error)
    throw error
  }
}

// Function to validate if fixture data already exists (with exclusion for editing)
export const validateFixtureData = async (fixtureData, excludeFixtureId = null) => {
  try {
    const existingFixtures = await getAllFixtures()
    const conflicts = []

    console.log('Existing fixtures data structure:', existingFixtures[0]) // Debug log

    // Check for potential duplicate fixtures
    existingFixtures.forEach(fixture => {
      // Skip validation for the fixture being edited - check multiple ID formats
      if (excludeFixtureId && (
        fixture.id === excludeFixtureId ||
        fixture.documentId === excludeFixtureId ||
        fixture.id?.toString() === excludeFixtureId?.toString() ||
        fixture.documentId?.toString() === excludeFixtureId?.toString()
      )) {
        return
      }

      // Check for same date + same club + same event type (potential duplicate)
      if (fixture.eventDate === fixtureData.eventDate &&
        fixture.eventType === fixtureData.eventType &&
        fixture.golf_club?.documentId === fixtureData.golfClubDocumentId) {
        conflicts.push(`A ${fixtureData.eventType} event is already scheduled for ${fixtureData.eventDate} at this club`)
      }

      // Check for same date + same event type (warn even if different club)
      if (fixture.eventDate === fixtureData.eventDate &&
        fixture.eventType === fixtureData.eventType &&
        fixture.golf_club?.documentId !== fixtureData.golfClubDocumentId) {
        const clubName = fixture.golf_club?.clubName || 'another club'
        conflicts.push(`A ${fixtureData.eventType} event is already scheduled for ${fixtureData.eventDate} at ${clubName}`)
      }
    })

    return {
      isValid: conflicts.length === 0,
      conflicts: conflicts
    }
  } catch (error) {
    console.error('Error validating fixture data:', error)
    // If validation fails due to API error, allow creation but log the error
    return {
      isValid: true,
      conflicts: [],
      validationError: 'Could not validate against existing fixtures due to API error'
    }
  }
}

// Function to check if fixture can be safely deleted
export const checkFixtureDeletionSafety = async (fixtureId) => {
  try {
    const warnings = []
    const blockers = []

    // Get the actual fixture first to get proper ID
    const fixture = await getFixtureById(fixtureId)
    const actualId = fixture.documentId || fixture.id

    console.log('Checking deletion safety for fixture:', {
      fixtureId,
      actualId,
      eventType: fixture.eventType,
      eventDate: fixture.eventDate
    })

    try {
      // Check for scores associated with this fixture
      let scores = []

      try {
        const scoresUrl1 = queryBuilder(SCORES_MODEL, `?filters[event][documentId][$eq]=${actualId}`)
        console.log('Checking scores at URL (documentId):', scoresUrl1)
        const scoresResponse1 = await axios.get(scoresUrl1)
        scores = scoresResponse1.data.data || []
      } catch (error) {
        console.log('documentId filter failed for scores, trying id filter:', error.message)
        const scoresUrl2 = queryBuilder(SCORES_MODEL, `?filters[event][id][$eq]=${actualId}`)
        console.log('Checking scores at URL (id):', scoresUrl2)
        const scoresResponse2 = await axios.get(scoresUrl2)
        scores = scoresResponse2.data.data || []
      }

      console.log('Found scores:', scores.length)

      if (scores.length > 0) {
        warnings.push(`This fixture has ${scores.length} score(s) associated with it`)
        blockers.push(`Cannot delete fixture with ${scores.length} recorded scores`)
      }
    } catch (error) {
      console.warn('Could not check scores for fixture:', error.message)
      warnings.push('Could not verify associated scores')
    }

    try {
      // Check for tee times associated with this fixture
      let teeTimes = []

      try {
        const teeTimesUrl1 = queryBuilder(TEE_TIMES_MODEL, `?filters[event][documentId][$eq]=${actualId}`)
        console.log('Checking tee times at URL (documentId):', teeTimesUrl1)
        const teeTimesResponse1 = await axios.get(teeTimesUrl1)
        teeTimes = teeTimesResponse1.data.data || []
      } catch (error) {
        console.log('documentId filter failed for tee times, trying id filter:', error.message)
        const teeTimesUrl2 = queryBuilder(TEE_TIMES_MODEL, `?filters[event][id][$eq]=${actualId}`)
        console.log('Checking tee times at URL (id):', teeTimesUrl2)
        const teeTimesResponse2 = await axios.get(teeTimesUrl2)
        teeTimes = teeTimesResponse2.data.data || []
      }

      console.log('Found tee times:', teeTimes.length)

      if (teeTimes.length > 0) {
        warnings.push(`This fixture has ${teeTimes.length} tee time(s) associated with it`)
        blockers.push(`Cannot delete fixture with ${teeTimes.length} assigned tee times`)
      }
    } catch (error) {
      console.warn('Could not check tee times for fixture:', error.message)
      warnings.push('Could not verify associated tee times')
    }

    // If we still don't have any warnings/blockers, try a manual check
    if (warnings.length === 0 && blockers.length === 0) {
      try {
        console.log('No automatic matches found, doing manual check...')

        const [allScores, allTeeTimes] = await Promise.all([
          axios.get(queryBuilder(SCORES_MODEL, "")),
          axios.get(queryBuilder(TEE_TIMES_MODEL, ""))
        ])

        const scoresForFixture = (allScores.data.data || []).filter(score =>
          score.event && (
            score.event.id === actualId ||
            score.event.documentId === actualId ||
            score.event.id?.toString() === actualId?.toString() ||
            score.event.documentId?.toString() === actualId?.toString()
          )
        )

        const teeTimesForFixture = (allTeeTimes.data.data || []).filter(teeTime =>
          teeTime.event && (
            teeTime.event.id === actualId ||
            teeTime.event.documentId === actualId ||
            teeTime.event.id?.toString() === actualId?.toString() ||
            teeTime.event.documentId?.toString() === actualId?.toString()
          )
        )

        console.log('Manual check found:', {
          scores: scoresForFixture.length,
          teeTimes: teeTimesForFixture.length
        })

        if (scoresForFixture.length > 0) {
          warnings.push(`This fixture has ${scoresForFixture.length} score(s) associated with it`)
          blockers.push(`Cannot delete fixture with ${scoresForFixture.length} recorded scores`)
        }

        if (teeTimesForFixture.length > 0) {
          warnings.push(`This fixture has ${teeTimesForFixture.length} tee time(s) associated with it`)
          blockers.push(`Cannot delete fixture with ${teeTimesForFixture.length} assigned tee times`)
        }

      } catch (error) {
        console.warn('Manual check also failed:', error.message)
        warnings.push('Unable to verify all associated data')
      }
    }

    const result = {
      canDelete: blockers.length === 0,
      warnings: warnings,
      blockers: blockers
    }

    console.log('Final safety check result:', result)
    return result
  } catch (error) {
    console.error('Error checking fixture deletion safety:', error)
    return {
      canDelete: false,
      warnings: [],
      blockers: ['Unable to verify fixture relationships due to API error: ' + error.message]
    }
  }
}

export const createFixture = async (fixtureData) => {
  try {
    // First validate the fixture data
    console.log('Validating fixture data before creation...')
    const validation = await validateFixtureData(fixtureData)

    if (!validation.isValid) {
      const error = new Error('Fixture validation failed')
      error.validationErrors = validation.conflicts
      throw error
    }

    // If validation warns about API error, log it but continue
    if (validation.validationError) {
      console.warn('Validation warning:', validation.validationError)
    }

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

export const updateFixture = async (fixtureId, fixtureData) => {
  try {
    // First validate the fixture data (excluding the fixture being edited)
    console.log('Validating fixture data before update...')
    const validation = await validateFixtureData(fixtureData, fixtureId)

    if (!validation.isValid) {
      const error = new Error('Fixture validation failed')
      error.validationErrors = validation.conflicts
      throw error
    }

    // If validation warns about API error, log it but continue
    if (validation.validationError) {
      console.warn('Validation warning:', validation.validationError)
    }

    // First, get the fixture to find the correct documentId
    const fixture = await getFixtureById(fixtureId)
    const actualId = fixture.documentId || fixture.id

    const url = queryBuilder(MODELS.events, `/${actualId}`)

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

    console.log('Updating fixture:', payload)
    console.log('To URL:', url)

    const response = await axios.put(url, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return response.data
  } catch (error) {
    console.error('Error updating fixture:', error)
    console.error('Response data:', error.response?.data)
    console.error('Response status:', error.response?.status)
    throw error
  }
}

export const deleteFixture = async (fixtureId) => {
  try {
    // Check deletion safety first
    const safetyCheck = await checkFixtureDeletionSafety(fixtureId)

    if (!safetyCheck.canDelete) {
      const error = new Error('Fixture cannot be deleted')
      error.blockers = safetyCheck.blockers
      error.warnings = safetyCheck.warnings
      throw error
    }

    // Get the fixture to find the correct documentId
    const fixture = await getFixtureById(fixtureId)
    const actualId = fixture.documentId || fixture.id

    const url = queryBuilder(MODELS.events, `/${actualId}`)
    console.log('Deleting fixture from:', url)

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
    console.error('Error deleting fixture:', error)
    console.error('Response data:', error.response?.data)
    console.error('Response status:', error.response?.status)
    throw error
  }
}