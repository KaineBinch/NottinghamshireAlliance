import { useAuth0 } from "@auth0/auth0-react";
import PageHeader from "../components/pageHeader";
import { useNavigate } from "react-router-dom";
import DownloadCSVFile from "../components/csv/downloadCSV";
import SheetTemplate from "../components/sheetTemplate";
import CSVPreview from "../components/csv/csvPreview";
import { useState, useEffect } from "react";

const AdminPage = () => {
  const { isAuthenticated, isLoading, loginWithPopup, logout } = useAuth0();
  const navigate = useNavigate();
  const [csvData, setCsvData] = useState([]);
  const [groupedData, setGroupedData] = useState({});

  useEffect(() => {
    // Automatically open login popup if the user is not authenticated
    if (!isAuthenticated && !isLoading) {
      loginWithPopup().catch((error) => console.error("Login failed", error));
    }
  }, [isAuthenticated, isLoading, loginWithPopup]);

  const handleLogout = () => {
    logout({ returnTo: window.location.origin });
    navigate("/");
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <PageHeader title="Admin" />
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
        {isAuthenticated && (
          <>
            {/* Existing Download and Import Cards */}
            <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0">
              <div className="flex-1 bg-[#214A27] p-6 rounded-lg shadow-lg">
                <SheetTemplate />
              </div>
              <div className="flex-1 bg-[#214A27] p-6 rounded-lg shadow-lg">
                <DownloadCSVFile
                  setCsvData={setCsvData}
                  setGroupedData={setGroupedData}
                  csvData={csvData}
                />
              </div>
            </div>

            {/* New Full-Width CSV Preview Card */}
            {csvData.length > 0 && (
              <div className="mt-6 bg-[#214A27] p-6 rounded-lg shadow-lg max-w-5xl">
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
                e.preventDefault();
                loginWithPopup().catch((error) =>
                  console.error("Login failed", error)
                );
              }}
              className="text-blue-500 hover:underline cursor-pointer"
            >
              log in
            </a>{" "}
            to continue.
          </div>
        )}
      </div>
    </>
  );
};

export default AdminPage;
