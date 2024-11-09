import { useAuth0 } from "@auth0/auth0-react";
import PageHeader from "../components/pageHeader";
import { useNavigate } from "react-router-dom";
import DownloadCSVFile from "../components/csv/downloadCSV";

const AdminPage = () => {
  const { isAuthenticated, isLoading, loginWithRedirect, logout } = useAuth0();
  const navigate = useNavigate();

  const handleLogin = () => {
    // Trigger the Auth0 login process with redirect
    loginWithRedirect({
      redirectUri: window.location.href, // Stay on the same page after login
    });
  };

  const handleLogout = () => {
    // Log out and redirect to the homepage
    logout({ returnTo: window.location.origin });
    navigate("/"); // Redirecting to the homepage on logout
  };

  // Show loading state until Auth0 determines authentication status
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <PageHeader title="Admin" />

      {/* Log out button, visible only if authenticated */}
      {isAuthenticated && (
        <div className="relative">
          <button
            className="absolute -mt-20 top-4 right-10 bg-[#214A27] text-white py-2 px-4 rounded hover:bg-green-600 transition duration-300"
            onClick={handleLogout}
          >
            Log Out
          </button>
        </div>
      )}

      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-black">
        {!isAuthenticated ? (
          <button
            onClick={handleLogin}
            className="bg-[#214A27] text-white py-2 px-4 rounded hover:bg-green-600 transition duration-300"
          >
            Login to Admin
          </button>
        ) : (
          <>
            <h2 className="my-[25px]">Import your Excel file below:</h2>
            <DownloadCSVFile />
          </>
        )}
      </div>
    </>
  );
};

export default AdminPage;
