import { useAuth0 } from "@auth0/auth0-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import CSVPreview from "../components/admin/import/csvPreview"
import DownloadCSVFile from "../components/admin/import/downloadCSV"
import LiveScoreControls from "../components/admin/LiveScoreControls"
import TemplateCard from "../components/admin/template/TemplateCard"
import UnifiedManagement from "../components/admin/unifiedManagement"
import PageHeader from "../components/pageHeader"
import "./adminPage.css"

const AdminPage = () => {
  const { isAuthenticated, isLoading, loginWithPopup, logout } = useAuth0()
  const [loginAttempted, setLoginAttempted] = useState(false)
  const navigate = useNavigate()
  const [csvData, setCsvData] = useState([])
  const [groupedData, setGroupedData] = useState({})

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

  if (isLoading) {
    return <div></div>
  }

  return (
    <>
      <PageHeader title="Admin" />
      {isAuthenticated && (
        <div className="logout-button-container">
          <button className="logout-button" onClick={handleLogout}>
            Log Out
          </button>
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

            {/* CSV Preview Section */}
            {csvData.length > 0 && (
              <div className="csv-preview-container">
                <CSVPreview csvData={csvData} groupedData={groupedData} />
              </div>
            )}

            {/* Unified Data Management Section */}
            <div className="mt-6">
              <div className="card-container">
                <UnifiedManagement />
              </div>
            </div>

            {/* Existing Import/Template Section */}
            <div className="my-6">
              <div className="card-container">
                <LiveScoreControls />
              </div>
            </div>
          </>
        )}

        {!isAuthenticated && (
          <div className="text-center py-8">
            <p className="text-lg mb-4">
              You must be logged in to view this page.
            </p>
            <p>
              Please{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  loginWithPopup().catch((error) =>
                    console.error("Login failed", error)
                  )
                }}
                className="login-link text-blue-500 hover:underline cursor-pointer">
                log in
              </a>{" "}
              to continue.
            </p>
          </div>
        )}
      </div>
    </>
  )
}

export default AdminPage
