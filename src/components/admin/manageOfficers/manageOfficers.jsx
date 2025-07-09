import { useState, useEffect } from "react"
import AddOfficer from "./addOfficers"
import EditOfficer from "./editOfficers"
import DeleteOfficer from "./deleteOfficers"
import { getAllOfficers } from "../../../utils/api/officersApi"

const ManageOfficers = () => {
  const [activeAction, setActiveAction] = useState(null)
  const [notification, setNotification] = useState(null)
  const [officersCount, setOfficersCount] = useState(0)
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const [officers, setOfficers] = useState([])
  const [filteredOfficers, setFilteredOfficers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOfficer, setSelectedOfficer] = useState(null)
  const [sortConfig, setSortConfig] = useState({
    key: "Name",
    direction: "asc",
  })

  // Load initial data
  useEffect(() => {
    loadOfficerData()
  }, [])

  // Filter and sort officers when data or search changes
  useEffect(() => {
    filterAndSortOfficers()
  }, [officers, searchTerm, sortConfig])

  const loadOfficerData = async () => {
    setIsLoadingStats(true)
    try {
      const officersData = await getAllOfficers()
      setOfficers(officersData)
      setOfficersCount(officersData.length)
    } catch (error) {
      console.error("Error loading officer data:", error)
      showNotification("Error loading officer data", "error")
    } finally {
      setIsLoadingStats(false)
    }
  }

  const filterAndSortOfficers = () => {
    let filtered = [...officers]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (officer) =>
          officer.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          officer.golf_club?.clubName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          officer.Positions?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortConfig.key] || ""
      let bValue = b[sortConfig.key] || ""

      // Handle golf club sorting
      if (sortConfig.key === "golf_club") {
        aValue = a.golf_club?.clubName || ""
        bValue = b.golf_club?.clubName || ""
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1
      return 0
    })

    setFilteredOfficers(filtered)
  }

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }))
  }

  const handlePositionClick = (officer) => {
    setSelectedOfficer(officer)
    setActiveAction("edit")
  }

  const showNotification = (message, type = "success") => {
    setNotification({ message, type })
    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setNotification(null)
    }, 5000)
  }

  const hideNotification = () => {
    setNotification(null)
  }

  const handleAddOfficerSuccess = async (result) => {
    console.log("Officer added successfully:", result)
    const officerName = result?.data?.Name || "New officer"
    showNotification(
      `✅ ${officerName} has been successfully added as an officer!`,
      "success"
    )
    await loadOfficerData()
    setTimeout(() => {
      setActiveAction(null)
      setSelectedOfficer(null)
    }, 2000)
  }

  const handleEditOfficerSuccess = async (result) => {
    console.log("Officer updated successfully:", result)
    const officerName = result?.data?.Name || "Officer"
    showNotification(
      `✅ ${officerName} information has been successfully updated!`,
      "success"
    )
    await loadOfficerData()
    setTimeout(() => {
      setActiveAction(null)
      setSelectedOfficer(null)
    }, 2000)
  }

  const handleDeleteOfficerSuccess = async (result) => {
    console.log("Officer deleted successfully:", result)
    showNotification(
      `✅ Officer has been successfully removed from the system.`,
      "success"
    )
    await loadOfficerData()
    setTimeout(() => {
      setActiveAction(null)
      setSelectedOfficer(null)
    }, 2000)
  }

  const handleCloseAction = () => {
    setActiveAction(null)
    setSelectedOfficer(null)
  }

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return "↕️"
    return sortConfig.direction === "asc" ? "↑" : "↓"
  }

  // If an action is active, show the appropriate component
  if (activeAction) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        {/* Show notification */}
        {notification && (
          <div
            className={`mb-4 p-4 border rounded ${
              notification.type === "success"
                ? "bg-green-100 text-green-700 border-green-300"
                : notification.type === "error"
                ? "bg-red-100 text-red-700 border-red-300"
                : "bg-blue-100 text-blue-700 border-blue-300"
            }`}>
            <div className="flex items-start justify-between">
              <div className="font-medium">{notification.message}</div>
              <button
                onClick={hideNotification}
                className="text-gray-400 hover:text-gray-600 transition-colors ml-4">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {activeAction === "add" && (
          <AddOfficer
            onClose={handleCloseAction}
            onSuccess={handleAddOfficerSuccess}
          />
        )}

        {activeAction === "edit" && (
          <EditOfficer
            onClose={handleCloseAction}
            onSuccess={handleEditOfficerSuccess}
            selectedOfficer={selectedOfficer}
          />
        )}

        {activeAction === "delete" && (
          <DeleteOfficer
            onClose={handleCloseAction}
            onSuccess={handleDeleteOfficerSuccess}
          />
        )}
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-6 text-[#214A27]">
        Manage Club Officers
      </h2>

      {/* Show notification */}
      {notification && (
        <div
          className={`mb-4 p-4 border rounded ${
            notification.type === "success"
              ? "bg-green-100 text-green-700 border-green-300"
              : notification.type === "error"
              ? "bg-red-100 text-red-700 border-red-300"
              : "bg-blue-100 text-blue-700 border-blue-300"
          }`}>
          <div className="flex items-start justify-between">
            <div className="font-medium">{notification.message}</div>
            <button
              onClick={hideNotification}
              className="text-gray-400 hover:text-gray-600 transition-colors ml-4">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left sidebar - Stats and Actions */}
        <div className="lg:w-1/3">
          <div className="bg-[#214A27] text-white p-6 rounded-lg">
            <h3 className="text-lg font-bold mb-4">Officers Management</h3>

            <p className="mb-6 text-green-100">
              Add new club officers, edit existing officer information, or
              remove officers who are no longer active.
              <br />
              <br />
              <strong>Tip:</strong> Click on any position in the table to edit
              it directly!
            </p>

            {/* Officers Count Pill */}
            <div className="mb-6">
              <div className="text-sm text-green-100">
                {isLoadingStats ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-300"></div>
                    <span>Loading...</span>
                  </div>
                ) : (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                    {officersCount}{" "}
                    {officersCount === 1 ? "Officer" : "Officers"}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 justify-center items-center">
              <button
                className="w-full bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded transition duration-300 font-medium flex items-center justify-center gap-2"
                onClick={() => setActiveAction("add")}>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Add New Officer
              </button>

              <button
                className="w-full bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded transition duration-300 font-medium flex items-center justify-center gap-2"
                onClick={() => setActiveAction("edit")}>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit Officer
              </button>

              <button
                className="w-full bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700 transition duration-300 font-medium flex items-center justify-center gap-2"
                onClick={() => setActiveAction("delete")}>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete Officer
              </button>
            </div>
          </div>
        </div>

        {/* Right content - Table */}
        <div className="lg:w-2/3">
          {/* Search bar */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search officers by name, club, or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#214A27]"
            />
          </div>

          {/* Officers Table */}
          {isLoadingStats ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#214A27]"></div>
              <span className="ml-2">Loading officers...</span>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#214A27] text-white">
                    <tr>
                      <th
                        className="px-4 py-3 text-left cursor-pointer hover:bg-green-600"
                        onClick={() => handleSort("Name")}>
                        Name {getSortIcon("Name")}
                      </th>
                      <th
                        className="px-4 py-3 text-left cursor-pointer hover:bg-green-600"
                        onClick={() => handleSort("golf_club")}>
                        Golf Club {getSortIcon("golf_club")}
                      </th>
                      <th
                        className="px-4 py-3 text-left cursor-pointer hover:bg-green-600"
                        onClick={() => handleSort("Positions")}>
                        Positions {getSortIcon("Positions")}
                      </th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-center">Row Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOfficers.map((officer, index) => (
                      <tr
                        key={officer.documentId || officer.id}
                        className={`${
                          index % 2 === 0 ? "bg-gray-50" : "bg-white"
                        } hover:bg-blue-50 transition-colors`}>
                        <td className="px-4 py-3 font-medium">
                          {officer.Name}
                        </td>
                        <td className="px-4 py-3">
                          {officer.golf_club?.clubName || "No Club"}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handlePositionClick(officer)}
                            className="text-[#214A27] hover:text-green-600 hover:underline font-medium cursor-pointer transition-colors"
                            title="Click to edit position">
                            {officer.Positions || "Unassigned"}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            Published
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedOfficer(officer)
                                setActiveAction("edit")
                              }}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="Edit Officer">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedOfficer(officer)
                                setActiveAction("delete")
                              }}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="Delete Officer">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredOfficers.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    {searchTerm
                      ? "No officers found matching your search."
                      : "No officers found."}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ManageOfficers
