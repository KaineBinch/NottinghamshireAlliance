import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import PageHeader from "../components/pageHeader";
import { useNavigate } from "react-router-dom";
import DownloadCSVFile from "../components/csv/downloadCSV";

const AdminPage = () => {
  const {
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout,
    isRedirecting,
  } = useAuth0();
  const navigate = useNavigate();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // Check if the user is authenticated, and if not, trigger login
    if (!isLoading && !isAuthenticated && !redirecting && !isRedirecting) {
      setRedirecting(true);
      loginWithRedirect({
        redirectUri: window.location.href,
      });
    }
  }, [
    isLoading,
    isAuthenticated,
    loginWithRedirect,
    redirecting,
    isRedirecting,
  ]);

  if (isLoading || isRedirecting) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <>
        <PageHeader title="Admin" />
      </>
    );
  }

  const handleLogout = () => {
    // Log out and redirect to the homepage
    logout({ returnTo: window.location.origin });
    navigate("/"); // Redirecting to the homepage on logout
  };

  return (
    <>
      <PageHeader title="Admin" />

      {/* Wrapper for absolute positioning of the Log Out button */}
      <div className="relative">
        <button
          className="absolute -mt-20 top-4 right-10 bg-[#214A27] text-white py-2 px-4 rounded hover:bg-green-600 transition duration-300"
          onClick={handleLogout}
        >
          Log Out
        </button>
      </div>

      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-black">
        <h2 className="my-[25px]">Import your Excel file below:</h2>
        <div>
          <DownloadCSVFile />
        </div>
      </div>
    </>
  );
};

export default AdminPage;
