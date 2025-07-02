import axios from "axios"
import { queryBuilder } from "../queryBuilder"
import { MODELS, API_URL } from "../../constants/api"

// Add missing golfers model constant
const GOLFERS_MODEL = "/golfers"

// Function to fetch all existing golf clubs for validation
export const getAllGolfClubs = async () => {
  try {
    const url = queryBuilder(MODELS.golfClubs, "")
    console.log('Fetching existing clubs from:', url)

    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return response.data.data || []
  } catch (error) {
    console.error('Error fetching golf clubs:', error)
    throw error
  }
}

// Function to fetch a single golf club by ID
export const getGolfClubById = async (clubId) => {
  try {
    // First try to get all clubs and find the specific one
    // This is more reliable with Strapi v5's documentId system
    const allClubs = await getAllGolfClubs()
    console.log('Looking for club with ID:', clubId)
    console.log('Available clubs:', allClubs.map(c => ({
      id: c.id,
      documentId: c.documentId,
      name: c.clubName
    })))

    const club = allClubs.find(c =>
      c.id === clubId ||
      c.documentId === clubId ||
      c.id?.toString() === clubId?.toString() ||
      c.documentId?.toString() === clubId?.toString()
    )

    if (!club) {
      throw new Error(`Club with ID ${clubId} not found`)
    }

    console.log('Found club:', club)
    return club
  } catch (error) {
    console.error('Error fetching golf club by ID:', error)
    throw error
  }
}

// Function to validate if club data already exists (with exclusion for editing)
export const validateClubData = async (clubData, excludeClubId = null) => {
  try {
    const existingClubs = await getAllGolfClubs()
    const conflicts = []

    console.log('Existing clubs data structure:', existingClubs[0]) // Debug log

    // Check each field for duplicates (excluding proName as requested)
    existingClubs.forEach(club => {
      // Skip validation for the club being edited - check multiple ID formats
      if (excludeClubId && (
        club.id === excludeClubId ||
        club.documentId === excludeClubId ||
        club.id?.toString() === excludeClubId?.toString() ||
        club.documentId?.toString() === excludeClubId?.toString()
      )) {
        return
      }

      // Check club name (case-insensitive)
      if (club.clubName &&
        club.clubName.toLowerCase().trim() === clubData.clubName.toLowerCase().trim()) {
        conflicts.push(`Club name "${clubData.clubName}" already exists`)
      }

      // Check club address (case-insensitive)
      if (club.clubAddress &&
        club.clubAddress.toLowerCase().trim() === clubData.clubAddress.toLowerCase().trim()) {
        conflicts.push(`Club address "${clubData.clubAddress}" already exists`)
      }

      // Check club URL (if provided)
      if (clubData.clubURL && club.clubURL &&
        club.clubURL.toLowerCase().trim() === clubData.clubURL.toLowerCase().trim()) {
        conflicts.push(`Club website "${clubData.clubURL}" already exists`)
      }

      // Check contact number (if provided)
      if (clubData.clubContactNumber && club.clubContactNumber &&
        club.clubContactNumber.toString().trim() === clubData.clubContactNumber.toString().trim()) {
        conflicts.push(`Contact number "${clubData.clubContactNumber}" already exists`)
      }

      // Check club ID (case-insensitive)
      if (club.clubID &&
        club.clubID.toLowerCase().trim() === clubData.clubID.toLowerCase().trim()) {
        conflicts.push(`Club ID "${clubData.clubID}" already exists`)
      }
    })

    return {
      isValid: conflicts.length === 0,
      conflicts: conflicts
    }
  } catch (error) {
    console.error('Error validating club data:', error)
    // If validation fails due to API error, allow creation but log the error
    return {
      isValid: true,
      conflicts: [],
      validationError: 'Could not validate against existing clubs due to API error'
    }
  }
}

// Function to check if club can be safely deleted
export const checkClubDeletionSafety = async (clubId) => {
  try {
    const warnings = []
    const blockers = []

    // Get the actual club first to get proper ID
    const club = await getGolfClubById(clubId)
    const actualId = club.documentId || club.id

    console.log('Checking deletion safety for club:', {
      clubId,
      actualId,
      clubName: club.clubName
    })

    try {
      // Check for events at this club - try multiple filter approaches
      let events = []

      // Try documentId first
      try {
        const eventsUrl1 = queryBuilder(MODELS.events, `?filters[golf_club][documentId][$eq]=${actualId}`)
        console.log('Checking events at URL (documentId):', eventsUrl1)
        const eventsResponse1 = await axios.get(eventsUrl1)
        events = eventsResponse1.data.data || []
      } catch (error) {
        console.log('documentId filter failed, trying id filter:', error.message)
        // Try regular id as fallback
        const eventsUrl2 = queryBuilder(MODELS.events, `?filters[golf_club][id][$eq]=${actualId}`)
        console.log('Checking events at URL (id):', eventsUrl2)
        const eventsResponse2 = await axios.get(eventsUrl2)
        events = eventsResponse2.data.data || []
      }

      console.log('Found events:', events.length)

      if (events.length > 0) {
        warnings.push(`This club has ${events.length} event(s) associated with it`)
        // Make this a blocker to prevent deletion
        blockers.push(`Cannot delete club with ${events.length} associated events`)
      }
    } catch (error) {
      console.warn('Could not check events for club:', error.message)
      warnings.push('Could not verify associated events')
    }

    try {
      // Check for golfers from this club - try multiple approaches
      let golfers = []

      // Try documentId first
      try {
        const golfersUrl1 = queryBuilder(GOLFERS_MODEL, `?filters[golf_club][documentId][$eq]=${actualId}`)
        console.log('Checking golfers at URL (documentId):', golfersUrl1)
        const golfersResponse1 = await axios.get(golfersUrl1)
        golfers = golfersResponse1.data.data || []
      } catch (error) {
        console.log('documentId filter failed for golfers, trying id filter:', error.message)
        // Try regular id as fallback
        const golfersUrl2 = queryBuilder(GOLFERS_MODEL, `?filters[golf_club][id][$eq]=${actualId}`)
        console.log('Checking golfers at URL (id):', golfersUrl2)
        const golfersResponse2 = await axios.get(golfersUrl2)
        golfers = golfersResponse2.data.data || []
      }

      console.log('Found golfers:', golfers.length)

      if (golfers.length > 0) {
        warnings.push(`This club has ${golfers.length} golfer(s) associated with it`)
        // Make this a blocker to prevent deletion
        blockers.push(`Cannot delete club with ${golfers.length} associated golfers`)
      }
    } catch (error) {
      console.warn('Could not check golfers for club:', error.message)
      warnings.push('Could not verify associated golfers')
    }

    // If we still don't have any warnings/blockers, try a manual check
    if (warnings.length === 0 && blockers.length === 0) {
      try {
        // Get all golfers and events and check manually
        console.log('No automatic matches found, doing manual check...')

        const [allEvents, allGolfers] = await Promise.all([
          axios.get(queryBuilder(MODELS.events, "")),
          axios.get(queryBuilder(GOLFERS_MODEL, ""))
        ])

        const eventsAtClub = (allEvents.data.data || []).filter(event =>
          event.golf_club && (
            event.golf_club.id === actualId ||
            event.golf_club.documentId === actualId ||
            event.golf_club.id?.toString() === actualId?.toString() ||
            event.golf_club.documentId?.toString() === actualId?.toString()
          )
        )

        const golfersAtClub = (allGolfers.data.data || []).filter(golfer =>
          golfer.golf_club && (
            golfer.golf_club.id === actualId ||
            golfer.golf_club.documentId === actualId ||
            golfer.golf_club.id?.toString() === actualId?.toString() ||
            golfer.golf_club.documentId?.toString() === actualId?.toString()
          )
        )

        console.log('Manual check found:', {
          events: eventsAtClub.length,
          golfers: golfersAtClub.length
        })

        if (eventsAtClub.length > 0) {
          warnings.push(`This club has ${eventsAtClub.length} event(s) associated with it`)
          blockers.push(`Cannot delete club with ${eventsAtClub.length} associated events`)
        }

        if (golfersAtClub.length > 0) {
          warnings.push(`This club has ${golfersAtClub.length} golfer(s) associated with it`)
          blockers.push(`Cannot delete club with ${golfersAtClub.length} associated golfers`)
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
    console.error('Error checking club deletion safety:', error)
    return {
      canDelete: false,
      warnings: [],
      blockers: ['Unable to verify club relationships due to API error: ' + error.message]
    }
  }
}

// Helper function to upload a file and associate it with a club field
const uploadFileToClub = async (clubId, fieldName, file) => {
  try {
    // Step 1: Upload the file to Strapi's media library
    const formData = new FormData()
    formData.append('files', file)

    // For Strapi v5, we need to handle folder assignment differently
    const fileInfo = {
      alternativeText: `${fieldName} for club ${clubId}`,
      caption: `${fieldName}`,
      name: `${fieldName}_club_${clubId}`
    }

    // Try to get the folder ID for organization
    const folderName = getClubMediaFolder(fieldName)
    if (folderName) {
      try {
        // Try to find the folder by name first
        const foldersResponse = await axios.get(`${API_URL}/upload/folders`)
        const folder = foldersResponse.data.data?.find(f => f.name === folderName)
        if (folder) {
          fileInfo.folder = folder.id
          console.log(`Assigning file to folder: ${folderName} (ID: ${folder.id})`)
        } else {
          console.log(`Folder ${folderName} not found, file will go to root`)
        }
      } catch (error) {
        console.log(`Could not determine folder, file will go to root:`, error.message)
      }
    }

    formData.append('fileInfo', JSON.stringify(fileInfo))

    console.log(`Uploading ${fieldName} to media library...`)

    const uploadResponse = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    const uploadedFiles = uploadResponse.data
    const uploadedFile = uploadedFiles[0] // Get the first (and only) uploaded file

    console.log(`${fieldName} uploaded successfully, ID:`, uploadedFile.id)

    // Step 2: Associate the uploaded file with the club record
    const updateData = {
      data: {
        [fieldName]: [uploadedFile.id] // Strapi media fields expect array of IDs
      }
    }

    console.log(`Associating ${fieldName} with club ${clubId} using documentId...`)

    const updateUrl = queryBuilder(MODELS.golfClubs, `/${clubId}`)
    console.log(`PUT URL: ${updateUrl}`)
    const associateResponse = await axios.put(updateUrl, updateData, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log(`${fieldName} successfully associated with club`)
    return uploadedFile

  } catch (error) {
    console.error(`Error uploading ${fieldName}:`, error)
    throw error
  }
}

// Helper function to determine media folder based on field type
const getClubMediaFolder = (fieldName) => {
  // You can organize files into different folders in Strapi's media library
  switch (fieldName) {
    case 'clubImage':
      return 'courses' // Will put club images in /courses folder
    case 'clubLogo':
      return 'logos'   // Will put club logos in /logos folder
    default:
      return null      // No folder organization
  }
}

export const createGolfClub = async (clubData) => {
  try {
    // First validate the club data
    console.log('Validating club data before creation...')
    const validation = await validateClubData(clubData)

    if (!validation.isValid) {
      const error = new Error('Club validation failed')
      error.validationErrors = validation.conflicts
      throw error
    }

    // If validation warns about API error, log it but continue
    if (validation.validationError) {
      console.warn('Validation warning:', validation.validationError)
    }

    // Check if we have files to upload
    const hasFiles = clubData.clubImage || clubData.clubLogo

    if (!hasFiles) {
      // No files - send as JSON (your existing approach)
      console.log('No files detected - sending as JSON')

      const url = queryBuilder(MODELS.golfClubs, "")
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
    }

    // Has files - use FormData approach
    console.log('Files detected - using FormData approach')

    // Step 1: Create the club record first without files
    const url = queryBuilder(MODELS.golfClubs, "")
    const initialPayload = {
      data: {
        clubName: clubData.clubName,
        clubAddress: clubData.clubAddress,
        clubURL: clubData.clubURL || null,
        clubContactNumber: clubData.clubContactNumber || null,
        clubID: clubData.clubID || null,
        proName: clubData.proName || null,
      }
    }

    console.log('Creating club record first:', initialPayload)

    const createResponse = await axios.post(url, initialPayload, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const createdClub = createResponse.data
    const clubId = createdClub.data.documentId || createdClub.data.id

    console.log('Club created successfully, documentId:', clubId, 'regular ID:', createdClub.data.id)

    // Step 2: Upload files if they exist and associate them with the club
    const filePromises = []

    if (clubData.clubImage) {
      console.log('Uploading club image...')
      filePromises.push(uploadFileToClub(clubId, 'clubImage', clubData.clubImage))
    }

    if (clubData.clubLogo) {
      console.log('Uploading club logo...')
      filePromises.push(uploadFileToClub(clubId, 'clubLogo', clubData.clubLogo))
    }

    // Wait for all file uploads to complete
    if (filePromises.length > 0) {
      try {
        await Promise.all(filePromises)
        console.log('All files uploaded successfully')
      } catch (fileError) {
        console.error('Error uploading files:', fileError)
        // Files failed but club was created - you could handle this differently
        // For now we'll continue and return the club data
      }
    }

    // Step 3: Fetch the updated club with populated media
    try {
      const updatedUrl = queryBuilder(MODELS.golfClubs, `/${clubId}?populate=*`)
      console.log(`Fetching updated club from: ${updatedUrl}`)
      const updatedResponse = await axios.get(updatedUrl)
      return updatedResponse.data
    } catch (error) {
      // If fetching updated data fails, return the original creation response
      console.warn('Could not fetch updated club data:', error.message)
      return createdClub
    }

  } catch (error) {
    console.error('Error creating golf club:', error)
    console.error('Response data:', error.response?.data)
    console.error('Response status:', error.response?.status)
    throw error
  }
}

export const updateGolfClub = async (clubId, clubData) => {
  try {
    // First validate the club data (excluding the club being edited)
    console.log('Validating club data before update...')
    const validation = await validateClubData(clubData, clubId)

    if (!validation.isValid) {
      const error = new Error('Club validation failed')
      error.validationErrors = validation.conflicts
      throw error
    }

    // If validation warns about API error, log it but continue
    if (validation.validationError) {
      console.warn('Validation warning:', validation.validationError)
    }

    // First, get the club to find the correct documentId
    const club = await getGolfClubById(clubId)
    const actualId = club.documentId || club.id

    // Check if we have files to upload
    const hasFiles = clubData.clubImage || clubData.clubLogo

    if (!hasFiles) {
      // No files - send as JSON (your existing approach)
      console.log('No files detected - updating with JSON')

      const url = queryBuilder(MODELS.golfClubs, `/${actualId}`)
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

      console.log('Updating golf club:', payload)
      console.log('To URL:', url)

      const response = await axios.put(url, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      return response.data
    }

    // Has files - handle file uploads
    console.log('Files detected - updating with files')

    // Step 1: Update the basic club data first
    const url = queryBuilder(MODELS.golfClubs, `/${actualId}`)
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

    console.log('Updating club data first:', payload)

    const updateResponse = await axios.put(url, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Step 2: Upload new files if they exist
    const filePromises = []

    if (clubData.clubImage) {
      console.log('Uploading new club image...')
      filePromises.push(uploadFileToClub(actualId, 'clubImage', clubData.clubImage))
    }

    if (clubData.clubLogo) {
      console.log('Uploading new club logo...')
      filePromises.push(uploadFileToClub(actualId, 'clubLogo', clubData.clubLogo))
    }

    // Wait for all file uploads to complete
    if (filePromises.length > 0) {
      try {
        await Promise.all(filePromises)
        console.log('All files uploaded successfully')
      } catch (fileError) {
        console.error('Error uploading files:', fileError)
        // Files failed but club was updated - you could handle this differently
      }
    }

    // Step 3: Return updated club with populated media
    try {
      const updatedUrl = queryBuilder(MODELS.golfClubs, `/${actualId}?populate=*`)
      console.log(`Fetching final updated club from: ${updatedUrl}`)
      const finalResponse = await axios.get(updatedUrl)
      return finalResponse.data
    } catch (error) {
      // If fetching updated data fails, return the original update response
      console.warn('Could not fetch updated club data:', error.message)
      return updateResponse.data
    }

  } catch (error) {
    console.error('Error updating golf club:', error)
    console.error('Response data:', error.response?.data)
    console.error('Response status:', error.response?.status)
    throw error
  }
}

export const deleteGolfClub = async (clubId) => {
  try {
    // Check deletion safety first
    const safetyCheck = await checkClubDeletionSafety(clubId)

    if (!safetyCheck.canDelete) {
      const error = new Error('Club cannot be deleted')
      error.blockers = safetyCheck.blockers
      error.warnings = safetyCheck.warnings
      throw error
    }

    // Get the club to find the correct documentId
    const club = await getGolfClubById(clubId)
    const actualId = club.documentId || club.id

    const url = queryBuilder(MODELS.golfClubs, `/${actualId}`)
    console.log('Deleting golf club from:', url)

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
    console.error('Error deleting golf club:', error)
    console.error('Response data:', error.response?.data)
    console.error('Response status:', error.response?.status)
    throw error
  }
}