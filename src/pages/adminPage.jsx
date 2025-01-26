import { useAuth0 } from "@auth0/auth0-react";
import PageHeader from "../components/pageHeader";
import { useNavigate } from "react-router-dom";
import DownloadCSVFile from "../components/admin/import/downloadCSV";
import TemplateCard from "../components/admin/template/TemplateCard";
import CSVPreview from "../components/admin/import/csvPreview";
import { useState, useEffect } from "react";
import AddFixture from "../components/admin/addFixture";
import AddClub from "../components/admin/addClub";
import { queryBuilder } from "../utils/queryBuilder";
import { MODELS, QUERIES } from "../constants/api";
import useFetch from "../utils/hooks/useFetch";

const AdminPage = () => {
  const { isAuthenticated, isLoading, loginWithPopup, logout } = useAuth0();
  const navigate = useNavigate();
  const [csvData, setCsvData] = useState([]);
  const [groupedData, setGroupedData] = useState({});
  const query = queryBuilder(MODELS.golfClubs, QUERIES.clubsQuery);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      loginWithPopup().catch((error) => console.error("Login failed", error));
    }
  }, [isAuthenticated, isLoading, loginWithPopup]);

  const handleLogout = () => {
    logout({ returnTo: window.location.origin });
    navigate("/");
  };

  const { loading, isError, data, error } = useFetch(query);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (loading) {
    return <p className="pt-[85px]">Loading...</p>;
  } else if (isError) {
    console.error("Error:", error);
    return <p className="pt-[85px]">Something went wrong...</p>;
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
            <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0">
              <div className="flex-1 bg-[#214A27] p-6 rounded-lg shadow-lg">
                <TemplateCard />
              </div>
              <div className="flex-1 bg-[#214A27] p-6 rounded-lg shadow-lg">
                <DownloadCSVFile
                  setCsvData={setCsvData}
                  setGroupedData={setGroupedData}
                  csvData={csvData}
                />
              </div>
            </div>
            <div className="flex-1 bg-[#214A27] p-6 my-5 rounded-lg shadow-lg">
              <AddFixture golfClubsData={data.data} />
              <AddClub />
            </div>

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
