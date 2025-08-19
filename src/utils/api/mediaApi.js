import axios from "axios"
import { API_URL } from "../../constants/api"

// Function to fetch all media files
export const getAllMediaFiles = async () => {
  try {
    const url = `${API_URL}/upload/files?populate=*`
    console.log('Fetching media files from:', url)

    const response = await axios.get(url)

    if (response.data?.data) {
      return response.data.data
    } else if (Array.isArray(response.data)) {
      return response.data
    } else {
      return response.data || []
    }
  } catch (error) {
    console.error('Error fetching media files:', error)
    throw error
  }
}

// Simple upload function - just upload files normally, no folder tricks
export const uploadMediaFiles = async (files, folderName = null) => {
  try {
    console.log(`Starting upload of ${files.length} files`)
    console.log('Files to upload:', files.map(f => ({
      name: f.name,
      type: f.type,
      size: f.size
    })))

    const formData = new FormData()

    // Add files to FormData - simple approach
    Array.from(files).forEach((file, index) => {
      console.log(`Adding file ${index + 1} to FormData:`, file.name)
      formData.append('files', file)
    })

    const url = `${API_URL}/upload`
    console.log('Uploading files to:', url)

    // Log FormData contents (for debugging)
    console.log('FormData entries:')
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1])
    }

    const response = await axios.post(url, formData, {
      timeout: 30000, // 30 second timeout for uploads
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    console.log('Upload successful, response:', response.data)
    return response.data
  } catch (error) {
    console.error('Error uploading files:', error)
    console.error('Response data:', error.response?.data)
    console.error('Response status:', error.response?.status)
    console.error('Request config:', error.config)
    throw error
  }
}

// Function to get folder statistics based on filename patterns
export const getFolderStatistics = async () => {
  try {
    const allFiles = await getAllMediaFiles()
    const stats = {
      all: allFiles.length,
      courses: 0,
      logos: 0,
      scrollLogos: 0,
    }

    allFiles.forEach((file) => {
      const fileName = file.name || ""
      const caption = file.caption || ""
      const altText = file.alternativeText || ""

      // Use filename patterns to categorize (works with your existing files)
      const fileData = `${fileName} ${caption} ${altText}`.toLowerCase()

      if (fileData.includes("course")) {
        stats.courses++
      } else if (fileData.includes("scroll") || fileData.includes("banner")) {
        stats.scrollLogos++
      } else if (fileData.includes("logo")) {
        stats.logos++
      }
    })

    return stats
  } catch (error) {
    console.error('Error getting folder statistics:', error)
    return { all: 0, courses: 0, logos: 0, scrollLogos: 0 }
  }
}

// Function to filter files by category based on filename patterns
export const getFilesByFolder = async (folderName) => {
  try {
    const allFiles = await getAllMediaFiles()

    if (!folderName || folderName === 'all') {
      return allFiles
    }

    return allFiles.filter(file => {
      const fileName = file.name || ""
      const caption = file.caption || ""
      const altText = file.alternativeText || ""

      // Filter based on filename patterns
      const fileData = `${fileName} ${caption} ${altText}`.toLowerCase()

      switch (folderName) {
        case 'courses':
          return fileData.includes('course')
        case 'logos':
          return fileData.includes('logo') && !fileData.includes('scroll') && !fileData.includes('banner')
        case 'scrollLogos':
          return fileData.includes('scroll') || fileData.includes('banner')
        default:
          return false
      }
    })
  } catch (error) {
    console.error('Error fetching files by folder:', error)
    throw error
  }
}

// Function to delete a file
export const deleteMediaFile = async (fileId) => {
  try {
    const url = `${API_URL}/upload/files/${fileId}`
    console.log('Deleting file from:', url)

    const response = await axios.delete(url)
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error deleting file:', error)
    throw error
  }
}

// Simplified create folder function (just for UI feedback)
export const createMediaFolder = async (folderName) => {
  try {
    if (!folderName || folderName.trim() === '') {
      throw new Error('Folder name is required')
    }

    const validFolderName = /^[a-zA-Z0-9_-]+$/.test(folderName)
    if (!validFolderName) {
      throw new Error('Folder name can only contain letters, numbers, hyphens, and underscores')
    }

    // For now, just return success - actual folder management would be done in Strapi admin
    console.log(`Virtual folder "${folderName}" created (files organized by filename patterns)`)

    return {
      success: true,
      folderName: folderName.trim(),
      message: 'Folder created (organized by filename patterns)'
    }
  } catch (error) {
    console.error('Error creating folder:', error)
    throw error
  }
}

// Function to get file details by ID
export const getMediaFileById = async (fileId) => {
  try {
    const url = `${API_URL}/upload/files/${fileId}`
    console.log('Fetching file details from:', url)

    const response = await axios.get(url)
    return response.data
  } catch (error) {
    console.error('Error fetching file details:', error)
    throw error
  }
}

// Helper function to format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Helper function to check if file is an image
export const isImageFile = (filename) => {
  if (!filename) return false
  return /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(filename)
}

// Helper function to get file extension
export const getFileExtension = (filename) => {
  if (!filename) return ''
  return filename.split('.').pop().toUpperCase()
}

// Helper function to validate file types for upload
export const validateFileType = (file, allowedTypes = null) => {
  const defaultAllowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
    'image/webp', 'image/svg+xml', 'application/pdf'
  ]

  const allowedMimeTypes = allowedTypes || defaultAllowedTypes

  if (!allowedMimeTypes.includes(file.type)) {
    throw new Error(`File type ${file.type} is not allowed`)
  }

  return true
}

// Dummy function for compatibility
export const ensureDefaultFolders = async () => {
  console.log('Using filename-based organization (no folder initialization needed)')
  return {
    courses: { success: true, message: 'Ready' },
    logos: { success: true, message: 'Ready' },
    scrollLogos: { success: true, message: 'Ready' }
  }
}