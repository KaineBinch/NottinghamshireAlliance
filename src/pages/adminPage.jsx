import { useAuth0 } from "@auth0/auth0-react"
import PageHeader from "../components/pageHeader"
import { useNavigate } from "react-router-dom"
import DownloadCSVFile from "../components/admin/import/downloadCSV"
import TemplateCard from "../components/admin/template/TemplateCard"
import CSVPreview from "../components/admin/import/csvPreview"
import { useState, useEffect } from "react"
import { clearCache } from "../utils/api/cacheService"
import axios from "axios"
import "./adminPage.css"

const AdminPage = () => {
  const { isAuthenticated, isLoading, loginWithPopup, logout } = useAuth0()
  const [loginAttempted, setLoginAttempted] = useState(false)
  const navigate = useNavigate()
  const [csvData, setCsvData] = useState([])
  const [groupedData, setGroupedData] = useState({})
  const [refreshStatus, setRefreshStatus] = useState({
    isLoading: false,
    message: "",
    success: null,
  })

  useEffect(() => {
    if (!isAuthenticated && !isLoading && !loginAttempted) {
      setLoginAttempted(true)
      loginWithPopup().catch((error) => {
        console.error("Login failed", error)
      })
    }
  }, [isAuthenticated, isLoading, loginWithPopup, loginAttempted])

  const handleLogout = () => {
    const productionOrigin = window.location.hostname.includes("localhost")
      ? window.location.origin
      : "https://nottsalliance.com"

    logout({
      logoutParams: {
        returnTo: productionOrigin,
      },
    })
    navigate("/")
  }

  const handleRefreshAllData = async () => {
    setRefreshStatus({
      isLoading: true,
      message: "Refreshing all data...",
      success: null,
    })

    try {
      // 1. Clear application cache
      clearCache()

      // 2. If you have a service worker, you can force it to update
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: "CLEAR_CACHE" })
      }

      // 3. Add a timestamp to bust browser cache for any future API requests
      axios.defaults.params = {
        ...axios.defaults.params,
        _t: Date.now(),
      }

      // 4. Wait a moment to ensure everything is processed
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setRefreshStatus({
        isLoading: false,
        message: "All data has been refreshed successfully!",
        success: true,
      })

      // Reset status message after a few seconds
      setTimeout(() => {
        setRefreshStatus({
          isLoading: false,
          message: "",
          success: null,
        })
      }, 5000)
    } catch (error) {
      console.error("Error refreshing data:", error)
      setRefreshStatus({
        isLoading: false,
        message: `Failed to refresh data: ${error.message}`,
        success: false,
      })
    }
  }

  if (isLoading) {
    return <div></div>
  }

  return (
    <>
      <PageHeader title="Admin" />

      {isAuthenticated && (
        <div className="logout-button-container">
          <button
            className="refresh-data-button"
            onClick={handleRefreshAllData}
            disabled={refreshStatus.isLoading}>
            {refreshStatus.isLoading ? (
              <span>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Refreshing...
              </span>
            ) : (
              <span>
                <svg
                  className="w-4 h-4 mr-2 inline"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh All Data
              </span>
            )}
          </button>
          <button className="logout-button" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      )}

      {refreshStatus.message && (
        <div
          className={`refresh-status-message ${
            refreshStatus.success === true
              ? "success"
              : refreshStatus.success === false
              ? "error"
              : ""
          }`}>
          {refreshStatus.message}
        </div>
      )}

      <div className="admin-container">
        {isAuthenticated && (
          <>
            <div className="card-layout">
              <div className="card-container">
                <TemplateCard />
              </div>
              <div className="card-container">
                <DownloadCSVFile
                  setCsvData={setCsvData}
                  setGroupedData={setGroupedData}
                  csvData={csvData}
                />
              </div>
            </div>

            {csvData.length > 0 && (
              <div className="csv-preview-container">
                <CSVPreview csvData={csvData} groupedData={groupedData} />
              </div>
            )}
          </>
        )}
        {!isAuthenticated && (
          <div>
            You must be logged in to view this page. <br />
            Please{" "}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                loginWithPopup().catch((error) =>
                  console.error("Login failed", error)
                )
              }}
              className="login-link">
              log in
            </a>{" "}
            to continue.
          </div>
        )}
      </div>
    </>
  )
}

export default AdminPage
