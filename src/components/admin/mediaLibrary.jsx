import { useState, useEffect } from "react"
import {
  Upload,
  Trash2,
  Download,
  Eye,
  Search,
  X,
  Image,
  File,
  Camera,
  FileText,
} from "lucide-react"
import {
  getFilesByFolder,
  getFolderStatistics,
  uploadMediaFiles,
  deleteMediaFile,
  formatFileSize,
  isImageFile,
  getFileExtension,
  validateFileType,
} from "../../utils/api/mediaApi"
import { API_URL } from "../../constants/api"

const MediaLibrary = () => {
  const [activeFolder, setActiveFolder] = useState(null) // Start with null - no folder selected
  const [files, setFiles] = useState([])
  const [folderStats, setFolderStats] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [notification, setNotification] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Upload form state
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [uploadCategory, setUploadCategory] = useState("courses")
  const [customName, setCustomName] = useState("")
  const [selectedFiles, setSelectedFiles] = useState([])
  const [previewFiles, setPreviewFiles] = useState([])

  // Available folders - removed 'all' option
  const defaultFolders = [
    {
      name: "courses",
      label: "Course Images",
      icon: "🏌️",
      color: "bg-blue-50 border-blue-200 text-blue-700",
    },
    {
      name: "logos",
      label: "Club Logos",
      icon: "🏷️",
      color: "bg-purple-50 border-purple-200 text-purple-700",
    },
    {
      name: "scrollLogos",
      label: "Banner Images",
      icon: "🎯",
      color: "bg-orange-50 border-orange-200 text-orange-700",
    },
  ]

  // Upload categories for the form
  const uploadCategories = [
    { value: "courses", label: "Course Images", suffix: "Course", icon: "🏌️" },
    { value: "logos", label: "Club Logos", suffix: "Logo", icon: "🏷️" },
    {
      value: "scrollLogos",
      label: "Banner Images",
      suffix: "ScrollLogo",
      icon: "🎯",
    },
  ]

  // Load folder stats on mount
  useEffect(() => {
    loadFolderStatistics()
  }, [])

  // Load files when folder changes
  useEffect(() => {
    if (activeFolder) {
      loadFiles()
    } else {
      setFiles([]) // Clear files when no folder selected
    }
  }, [activeFolder])

  const loadFolderStatistics = async () => {
    try {
      const stats = await getFolderStatistics()
      setFolderStats(stats)
    } catch (error) {
      console.error("Error loading folder statistics:", error)
      setFolderStats({ courses: 0, logos: 0, scrollLogos: 0 })
    }
  }

  const loadFiles = async () => {
    if (!activeFolder) return

    setIsLoading(true)
    try {
      const filesData = await getFilesByFolder(activeFolder)
      setFiles(filesData)
    } catch (error) {
      console.error("Error loading files:", error)
      showNotification("❌ Failed to load files", "error")
      setFiles([])
    } finally {
      setIsLoading(false)
    }
  }

  const showNotification = (message, type = "success") => {
    setNotification({ message, type })
    setTimeout(() => {
      setNotification(null)
    }, 5000)
  }

  const hideNotification = () => {
    setNotification(null)
  }

  // Handle file selection in the form
  const handleFileSelection = (event) => {
    const files = Array.from(event.target.files)
    console.log("Files selected:", files)
    console.log(
      "File details:",
      files.map((f) => ({
        name: f.name,
        type: f.type,
        size: f.size,
      }))
    )

    setSelectedFiles(files)

    // Create preview objects
    const previews = files.map((file) => ({
      file,
      preview: isImageFile(file.name) ? URL.createObjectURL(file) : null,
      originalName: file.name,
      finalName: generateFileName(file.name),
    }))
    setPreviewFiles(previews)
    console.log("Previews created:", previews)
  }

  // Generate the final filename based on category and custom name
  const generateFileName = (originalName, customNameOverride = null) => {
    const category = uploadCategories.find(
      (cat) => cat.value === uploadCategory
    )
    const extension = originalName.split(".").pop()
    const baseName =
      customNameOverride || customName || originalName.split(".")[0]

    // Clean the base name (remove existing suffixes to avoid duplication)
    let cleanName = baseName
      .replace(/course$/i, "")
      .replace(/logo$/i, "")
      .replace(/scrolllogo$/i, "")
      .replace(/scroll$/i, "")
      .replace(/banner$/i, "")
      .trim()

    return `${cleanName}${category.suffix}.${extension}`
  }

  // Update preview when custom name or category changes
  useEffect(() => {
    if (previewFiles.length > 0) {
      setPreviewFiles((prev) =>
        prev.map((item) => ({
          ...item,
          finalName: generateFileName(item.originalName),
        }))
      )
    }
  }, [customName, uploadCategory])

  const handleFormUpload = async () => {
    if (selectedFiles.length === 0) {
      showNotification("Please select files to upload", "warning")
      return
    }

    console.log("Starting upload process...")
    console.log("Selected files:", selectedFiles)
    console.log("Upload category:", uploadCategory)

    setIsUploading(true)

    try {
      // Validate files - but don't let validation stop the process
      selectedFiles.forEach((file, index) => {
        console.log(`Validating file ${index + 1}:`, {
          name: file.name,
          type: file.type,
          size: file.size,
        })
        try {
          validateFileType(file)
          console.log(`File ${index + 1} validation passed`)
        } catch (validationError) {
          console.error(`File ${index + 1} validation failed:`, validationError)
          // Don't throw here - let's see if upload works anyway
        }
      })

      // Create new file objects with renamed files
      const renamedFiles = selectedFiles.map((file, index) => {
        const finalName = previewFiles[index].finalName
        console.log(`Renaming: ${file.name} → ${finalName}`)
        return new File([file], finalName, { type: file.type })
      })

      console.log("Renamed files:", renamedFiles)
      console.log("About to call uploadMediaFiles...")

      const result = await uploadMediaFiles(renamedFiles)
      console.log("Upload result:", result)

      const categoryLabel =
        uploadCategories.find((cat) => cat.value === uploadCategory)?.label ||
        uploadCategory

      showNotification(
        `✅ Successfully uploaded ${renamedFiles.length} file${
          renamedFiles.length > 1 ? "s" : ""
        } to ${categoryLabel}!`,
        "success"
      )

      // Reset form
      setShowUploadForm(false)
      setSelectedFiles([])
      setPreviewFiles([])
      setCustomName("")

      // Clean up preview URLs
      previewFiles.forEach((item) => {
        if (item.preview) {
          URL.revokeObjectURL(item.preview)
        }
      })

      // Refresh data
      console.log("Refreshing data...")
      await Promise.all([loadFolderStatistics(), loadFiles()])

      // Set active folder to the uploaded category if not already set
      if (!activeFolder || activeFolder !== uploadCategory) {
        setActiveFolder(uploadCategory)
      }
    } catch (error) {
      console.error("Upload error:", error)
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      })
      showNotification(`❌ Upload failed: ${error.message}`, "error")
    } finally {
      setIsUploading(false)
    }
  }

  const cancelUpload = () => {
    // Clean up preview URLs
    previewFiles.forEach((item) => URL.revokeObjectURL(item.preview))

    setShowUploadForm(false)
    setSelectedFiles([])
    setPreviewFiles([])
    setCustomName("")
  }

  const handleDeleteFile = async (file) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${file.name}"? This action cannot be undone.`
      )
    ) {
      return
    }

    try {
      await deleteMediaFile(file.id)
      showNotification(
        `✅ File "${file.name}" deleted successfully!`,
        "success"
      )
      await Promise.all([loadFolderStatistics(), loadFiles()])
    } catch (error) {
      console.error("Delete error:", error)
      showNotification(`❌ Failed to delete file: ${error.message}`, "error")
    }
  }

  const handleDownloadFile = (file) => {
    try {
      const fileUrl = file.url || file.src
      if (!fileUrl) {
        showNotification("❌ File URL not available", "error")
        return
      }

      const link = document.createElement("a")
      link.href = fileUrl
      link.download = file.name || "download"
      link.target = "_blank"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Download error:", error)
      showNotification("❌ Failed to download file", "error")
    }
  }

  const handleViewFile = (file) => {
    const fileUrl = file.url || file.src
    if (fileUrl) {
      window.open(fileUrl, "_blank")
    } else {
      showNotification("❌ File URL not available", "error")
    }
  }

  // Filter files based on search term
  const filteredFiles = files.filter((file) => {
    const fileName = file.name || ""
    return fileName.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const getCurrentFolderData = () => {
    return defaultFolders.find((f) => f.name === activeFolder)
  }

  // Helper function to get file URL for display
  const getFileUrl = (file) => {
    const baseUrl = API_URL.replace("/api", "")
    const relativeUrl = file.url || file.src || file.formats?.thumbnail?.url

    if (!relativeUrl) return "#"

    if (relativeUrl.startsWith("http")) {
      return relativeUrl
    }

    return `${baseUrl}${relativeUrl}`
  }

  // Helper function to get file size
  const getFileSize = (file) => {
    return file.size || file.fileSize || 0
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Media Library
          </h1>
          <p className="text-gray-600">
            Manage your golf club images and assets
          </p>
        </div>

        {/* Upload Form Modal */}
        {showUploadForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Upload Files
                </h3>
                <button
                  onClick={cancelUpload}
                  className="text-gray-400 hover:text-gray-600 p-1">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Category Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Category
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {uploadCategories.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => setUploadCategory(category.value)}
                      className={`p-4 border-2 rounded-xl text-left transition-all ${
                        uploadCategory === category.value
                          ? "border-green-500 bg-green-50 text-green-700 shadow-md"
                          : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                      }`}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{category.icon}</span>
                        <span className="font-semibold">{category.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Name */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Custom Name (optional)
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g., 'beeston', 'coxmoor', 'mapperly'"
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Leave blank to use the original filename
                </p>
              </div>

              {/* File Selection - EXACT copy from AddClub */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Files
                </label>
                <div className="relative">
                  <input
                    type="file"
                    id="file-upload"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileSelection}
                    className="hidden"
                    disabled={isUploading}
                    multiple
                  />
                  <label
                    htmlFor="file-upload"
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ${
                      selectedFiles.length > 0
                        ? "border-green-400 bg-green-50"
                        : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                    } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}>
                    {selectedFiles.length > 0 ? (
                      <div className="text-center">
                        <div className="text-green-600 mb-2">
                          <svg
                            className="w-12 h-12 mx-auto"
                            fill="currentColor"
                            viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <p className="text-lg font-medium text-green-700 mb-1">
                          {selectedFiles.length} file
                          {selectedFiles.length !== 1 ? "s" : ""} selected
                        </p>
                        <p className="text-sm text-green-600">
                          Ready to upload
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Camera className="w-16 h-16 text-gray-400 mb-4" />
                        <span className="text-lg font-medium text-gray-700 mb-1">
                          Click to upload files
                        </span>
                        <span className="text-sm text-gray-500">
                          JPEG, PNG, WebP (max 5MB each)
                        </span>
                      </div>
                    )}
                  </label>
                </div>

                {/* Debug info */}
                <div className="mt-2 p-2 bg-green-100 text-xs">
                  <strong>Selected:</strong> {selectedFiles.length} files
                  {selectedFiles.length > 0 && (
                    <div className="mt-1">
                      {selectedFiles.map((f, i) => (
                        <div key={i}>
                          • {f.name} ({f.type}, {formatFileSize(f.size)})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* File Preview */}
              {previewFiles.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-700 mb-3">
                    Preview ({previewFiles.length} files)
                  </h4>
                  <div className="max-h-60 overflow-y-auto space-y-3 bg-gray-50 p-4 rounded-lg">
                    {previewFiles.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-3 bg-white rounded-lg border">
                        {isImageFile(item.file.name) ? (
                          <img
                            src={item.preview}
                            alt="Preview"
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <FileText className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-500 truncate mb-1">
                            Original: {item.originalName}
                          </p>
                          <p className="text-sm font-semibold text-green-600 truncate">
                            Final: {item.finalName}
                          </p>
                        </div>
                        <span className="text-sm text-gray-400 font-medium">
                          {formatFileSize(item.file.size)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 justify-end">
                <button
                  onClick={cancelUpload}
                  className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  Cancel
                </button>
                <button
                  onClick={handleFormUpload}
                  disabled={selectedFiles.length === 0 || isUploading}
                  className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                    selectedFiles.length === 0 || isUploading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700 shadow-lg"
                  }`}>
                  {isUploading
                    ? "Uploading..."
                    : `Upload ${selectedFiles.length} file${
                        selectedFiles.length !== 1 ? "s" : ""
                      }`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notification */}
        {notification && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              notification.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : notification.type === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : notification.type === "warning"
                ? "bg-yellow-50 border-yellow-200 text-yellow-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
            }`}>
            <div className="flex items-center justify-between">
              <div className="font-medium">{notification.message}</div>
              <button
                onClick={hideNotification}
                className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Upload Button */}
        <div className="text-center mb-8">
          <button
            onClick={() => setShowUploadForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-3 mx-auto">
            <Upload className="w-6 h-6" />
            Upload New Files
          </button>
        </div>

        {/* Folder Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {defaultFolders.map((folder) => (
            <button
              key={folder.name}
              onClick={() =>
                setActiveFolder(
                  activeFolder === folder.name ? null : folder.name
                )
              }
              className={`p-6 rounded-xl border-2 transition-all text-left hover:shadow-lg ${
                activeFolder === folder.name
                  ? `${folder.color} border-current shadow-lg scale-105`
                  : "bg-white border-gray-200 hover:border-gray-300"
              }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{folder.icon}</span>
                  <span className="text-xl font-bold">{folder.label}</span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    activeFolder === folder.name
                      ? "bg-white bg-opacity-50"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                  {folderStats[folder.name] || 0}
                </span>
              </div>
              <p className="text-sm opacity-75">
                {activeFolder === folder.name
                  ? "Click to close"
                  : "Click to view files"}
              </p>
            </button>
          ))}
        </div>

        {/* Files Display */}
        {activeFolder && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            {/* Folder Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getCurrentFolderData()?.icon}</span>
                <h2 className="text-2xl font-bold text-gray-900">
                  {getCurrentFolderData()?.label}
                </h2>
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-semibold">
                  {filteredFiles.length} files
                </span>
              </div>

              {/* Search */}
              {files.length > 0 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-64"
                  />
                </div>
              )}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Loading files...</p>
              </div>
            )}

            {/* Files Grid */}
            {!isLoading && (
              <>
                {filteredFiles.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredFiles.map((file) => (
                      <div
                        key={file.id || file.documentId}
                        className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-all border border-gray-200 hover:border-gray-300">
                        {/* File Preview */}
                        <div className="aspect-square bg-gray-100 flex items-center justify-center">
                          {isImageFile(file.name) ? (
                            <img
                              src={getFileUrl(file)}
                              alt={file.name || "Image"}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none"
                                e.target.nextSibling.style.display = "flex"
                              }}
                            />
                          ) : (
                            <div className="text-gray-400 text-center">
                              <File className="w-12 h-12 mx-auto mb-2" />
                              <span className="text-xs font-medium">
                                {getFileExtension(file.name)}
                              </span>
                            </div>
                          )}
                          {/* Fallback for broken images */}
                          <div className="text-gray-400 text-center hidden">
                            <Image className="w-12 h-12 mx-auto mb-2" />
                            <span className="text-xs">Image</span>
                          </div>
                        </div>

                        {/* File Info */}
                        <div className="p-4">
                          <h4
                            className="font-semibold text-sm truncate mb-1 text-gray-900"
                            title={file.name}>
                            {file.name || "Unnamed file"}
                          </h4>
                          <p className="text-xs text-gray-500 mb-3">
                            {formatFileSize(getFileSize(file))}
                          </p>

                          {/* Action Buttons */}
                          <div className="flex justify-between items-center">
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleViewFile(file)}
                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View file">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDownloadFile(file)}
                                className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Download file">
                                <Download className="w-4 h-4" />
                              </button>
                            </div>

                            <button
                              onClick={() => handleDeleteFile(file)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete file">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {searchTerm ? "No files found" : "No files yet"}
                    </h3>
                    <p className="text-gray-500 mb-6">
                      {searchTerm
                        ? `No files match "${searchTerm}"`
                        : `Upload some files to populate this ${getCurrentFolderData()?.label.toLowerCase()} category`}
                    </p>
                    {!searchTerm && (
                      <button
                        onClick={() => {
                          setUploadCategory(activeFolder)
                          setShowUploadForm(true)
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                        Upload Files
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Welcome State */}
        {!activeFolder && (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">📁</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Choose a Category
            </h2>
            <p className="text-gray-600 text-lg">
              Select a category above to view and manage your files
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default MediaLibrary
