import { useNavigate } from "react-router-dom"

const AdminNavbar = () => {
  const navigate = useNavigate()

  const handleHomeClick = () => {
    navigate("/")
  }

  return (
    <div className="navbar-container">
      <div className="navbar-content">
        {/* Simple centered home button */}
        <div className="flex items-center justify-center w-full">
          <button
            onClick={handleHomeClick}
            className="nav-link px-6 py-2 text-lg font-medium">
            ← Back to Site
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminNavbar
