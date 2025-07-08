import axios from "axios"
import { queryBuilder } from "../queryBuilder"
import { MODELS } from "../../constants/api"

// Function to fetch all existing officers for validation
export const getAllOfficers = async () => {
  try {
    const url = queryBuilder(MODELS.clubOfficers, "?populate=*")
    console.log('Fetching existing officers from:', url)

    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return response.data.data || []
  } catch (error) {
    console.error('Error fetching officers:', error)
    throw error
  }
}

// Function to fetch a single officer by ID
export const getOfficerById = async (officerId) => {
  try {
    // First try to get all officers and find the specific one
    // This is more reliable with Strapi v5's documentId system
    const allOfficers = await getAllOfficers()
    console.log('Looking for officer with ID:', officerId)
    console.log('Available officers:', allOfficers.map(o => ({
      id: o.id,
      documentId: o.documentId,
      name: o.Name
    })))

    const officer = allOfficers.find(o =>
      o.id === officerId ||
      o.documentId === officerId ||
      o.id?.toString() === officerId?.toString() ||
      o.documentId?.toString() === officerId?.toString()
    )

    if (!officer) {
      throw new Error(`Officer with ID ${officerId} not found`)
    }

    console.log('Found officer:', officer)
    return officer
  } catch (error) {
    console.error('Error fetching officer by ID:', error)
    throw error
  }
}

// Function to validate if officer data already exists (with exclusion for editing)
export const validateOfficerData = async (officerData, excludeOfficerId = null) => {
  try {
    const existingOfficers = await getAllOfficers()
    const conflicts = []

    console.log('Existing officers data structure:', existingOfficers[0]) // Debug log

    // Check each field for duplicates
    existingOfficers.forEach(officer => {
      // Skip validation for the officer being edited - check multiple ID formats
      if (excludeOfficerId && (
        officer.id === excludeOfficerId ||
        officer.documentId === excludeOfficerId ||
        officer.id?.toString() === excludeOfficerId?.toString() ||
        officer.documentId?.toString() === excludeOfficerId?.toString()
      )) {
        return
      }

      // Check for exact name match within the same golf club
      if (officer.Name?.toLowerCase().trim() === officerData.Name?.toLowerCase().trim() &&
        officer.golf_club?.documentId === officerData.golfClubDocumentId) {
        conflicts.push(`Officer "${officerData.Name}" already exists for this golf club`)
      }
    })

    return {
      isValid: conflicts.length === 0,
      conflicts: conflicts
    }

  } catch (error) {
    console.error('Error validating officer data:', error)
    return {
      isValid: false,
      conflicts: [],
      validationError: error.message
    }
  }
}

// Function to check if officer can be safely deleted
export const checkOfficerDeletionSafety = async (officerId) => {
  try {
    const officer = await getOfficerById(officerId)
    const warnings = []
    const blockers = []

    // Officers typically don't have as many dependencies as clubs or golfers
    // But we can still provide warnings about the deletion

    warnings.push(`Officer "${officer.Name}" will be permanently removed`)
    if (officer.golf_club?.clubName) {
      warnings.push(`This officer is associated with ${officer.golf_club.clubName}`)
    }

    return {
      canDelete: blockers.length === 0,
      warnings: warnings,
      blockers: blockers
    }

  } catch (error) {
    console.error('Error checking officer deletion safety:', error)
    return {
      canDelete: false,
      warnings: [],
      blockers: [`Unable to verify officer data: ${error.message}`]
    }
  }
}

export const createOfficer = async (officerData) => {
  try {
    // First validate the officer data
    console.log('Validating officer data before creation...')
    const validation = await validateOfficerData(officerData)

    if (!validation.isValid) {
      const error = new Error('Officer validation failed')
      error.validationErrors = validation.conflicts
      throw error
    }

    // If validation warns about API error, log it but continue
    if (validation.validationError) {
      console.warn('Validation warning:', validation.validationError)
    }

    const url = queryBuilder(MODELS.clubOfficers, "")
    const payload = {
      data: {
        Name: officerData.Name,
        Positions: officerData.Positions,
        golf_club: officerData.golfClubDocumentId,
      }
    }

    console.log('Creating officer:', payload)
    console.log('To URL:', url)

    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return response.data

  } catch (error) {
    console.error('Error creating officer:', error)
    console.error('Response data:', error.response?.data)
    console.error('Response status:', error.response?.status)
    throw error
  }
}

export const updateOfficer = async (officerId, officerData) => {
  try {
    // First validate the officer data (excluding the officer being edited)
    console.log('Validating officer data before update...')
    const validation = await validateOfficerData(officerData, officerId)

    if (!validation.isValid) {
      const error = new Error('Officer validation failed')
      error.validationErrors = validation.conflicts
      throw error
    }

    // If validation warns about API error, log it but continue
    if (validation.validationError) {
      console.warn('Validation warning:', validation.validationError)
    }

    // First, get the officer to find the correct documentId
    const officer = await getOfficerById(officerId)
    const actualId = officer.documentId || officer.id

    const url = queryBuilder(MODELS.clubOfficers, `/${actualId}`)
    const payload = {
      data: {
        Name: officerData.Name,
        Positions: officerData.Positions,
        golf_club: officerData.golfClubDocumentId,
      }
    }

    console.log('Updating officer:', payload)
    console.log('To URL:', url)

    const response = await axios.put(url, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return response.data

  } catch (error) {
    console.error('Error updating officer:', error)
    console.error('Response data:', error.response?.data)
    console.error('Response status:', error.response?.status)
    throw error
  }
}

export const deleteOfficer = async (officerId) => {
  try {
    // Check deletion safety first
    const safetyCheck = await checkOfficerDeletionSafety(officerId)

    if (!safetyCheck.canDelete) {
      const error = new Error('Officer cannot be deleted')
      error.blockers = safetyCheck.blockers
      error.warnings = safetyCheck.warnings
      throw error
    }

    // Get the officer to find the correct documentId
    const officer = await getOfficerById(officerId)
    const actualId = officer.documentId || officer.id

    const url = queryBuilder(MODELS.clubOfficers, `/${actualId}`)
    console.log('Deleting officer from:', url)

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
    console.error('Error deleting officer:', error)
    console.error('Response data:', error.response?.data)
    console.error('Response status:', error.response?.status)
    throw error
  }
}