import PageHeader from "../components/pageHeader"
import { BASE_URL, MODELS, QUERIES } from "../constants/api"
import useFetch from "../utils/hooks/useFetch"
import { queryBuilder } from "../utils/queryBuilder"
import { formatClubName } from "../utils/formatClubName"
import { ClubOfficersPageSkeleton } from "../components/skeletons"
import { useState, useEffect } from "react"
import "./clubOfficersPage.css"

const ClubOfficersPage = () => {
  const query = queryBuilder(MODELS.clubOfficers, QUERIES.officerQuery)
  const { isLoading, isError, data, error } = useFetch(query)
  const [showOfficers, setShowOfficers] = useState(false)

  useEffect(() => {
    if (!isLoading && data?.data) {
      setShowOfficers(false)
      const timer = setTimeout(() => {
        setShowOfficers(true)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isLoading, data])

  if (isLoading) return <ClubOfficersPageSkeleton />

  if (isError) {
    console.error("Error:", error)
    return (
      <div className="error-container text-center">
        <p className="mb-4">
          Something went wrong loading the club officers information.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-[#214A27] text-white px-4 py-2 rounded hover:bg-[#1a3a1f] transition">
          Try Again
        </button>
      </div>
    )
  }

  // Group officers by their positions and sort by image availability
  const groupedOfficers = {
    President:
      data?.data
        ?.filter((officer) => officer.Positions === "President")
        .sort((a, b) => (b.Image?.url ? 1 : 0) - (a.Image?.url ? 1 : 0)) || [],
    Secretary:
      data?.data
        ?.filter((officer) => officer.Positions === "Secretary")
        .sort((a, b) => (b.Image?.url ? 1 : 0) - (a.Image?.url ? 1 : 0)) || [],
    "Honorary Treasurer":
      data?.data
        ?.filter((officer) => officer.Positions === "Honorary Treasurer")
        .sort((a, b) => (b.Image?.url ? 1 : 0) - (a.Image?.url ? 1 : 0)) || [],
    "Committee Member":
      data?.data
        ?.filter((officer) => officer.Positions === "Committee Member")
        .sort((a, b) => (b.Image?.url ? 1 : 0) - (a.Image?.url ? 1 : 0)) || [],
  }

  const OfficerCard = ({ officer, index, delayMultiplier = 0, roleTag }) => (
    <div
      key={officer.id}
      className={`bg-white shadow-md rounded-lg overflow-hidden p-4 w-64 text-center transition-all duration-500 ease-in-out relative ${
        showOfficers ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
      style={{
        transitionDelay: showOfficers
          ? `${(delayMultiplier + index) * 100}ms`
          : "0ms",
      }}>
      {/* Role badge */}
      <div className="absolute top-2 left-2">
        <span className="bg-[#214A27] text-white text-xs px-2 py-1 rounded-full font-medium">
          {roleTag}
        </span>
      </div>

      <div className="flex justify-center items-center mb-4 mt-3">
        {officer.Image?.url ? (
          <img
            className="w-36 h-36 object-cover rounded-full border-4 border-gray-200"
            src={`${BASE_URL}${officer.Image.url}`}
            alt={officer.Name}
          />
        ) : (
          <div className="w-36 h-36 flex items-center justify-center bg-gray-300 rounded-full text-gray-600 text-sm">
            No Image
          </div>
        )}
      </div>
      <span className="block font-semibold text-lg officer-name">
        {officer.Name}
      </span>
      <span className="block text-gray-500 text-xs mt-1 officer-club">
        {formatClubName(officer.golf_club?.clubName).replace(
          "Admirals",
          "Park"
        )}
      </span>
    </div>
  )

  return (
    <>
      <PageHeader title="Club Officers" />
      <hr className="border-black" />
      <div className="description-section">
        <div className="description-container">
          <p>Please see below this year&apos;s committee members.</p>
        </div>
        <hr className="border-black" />
      </div>

      <div className="bg-[#D9D9D9] py-8">
        <div className="officers-container">
          {/* President Section */}
          {groupedOfficers.President.length > 0 && (
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-[#214A27] mb-3 text-center">
                President
              </h2>
              <div className="flex justify-center">
                <div className="grid grid-cols-1 gap-2 md:gap-4 place-items-center">
                  {groupedOfficers.President.map((officer, index) => (
                    <OfficerCard
                      key={officer.id}
                      officer={officer}
                      index={index}
                      delayMultiplier={0}
                      roleTag="President"
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Secretary & Treasurer Section */}
          {(groupedOfficers.Secretary.length > 0 ||
            groupedOfficers["Honorary Treasurer"].length > 0) && (
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-[#214A27] mb-3 text-center">
                Secretary & Treasurer
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 place-items-center max-w-3xl mx-auto">
                {groupedOfficers.Secretary.map((officer, index) => (
                  <OfficerCard
                    key={officer.id}
                    officer={officer}
                    index={index}
                    delayMultiplier={groupedOfficers.President.length}
                    roleTag="Secretary"
                  />
                ))}
                {groupedOfficers["Honorary Treasurer"].map((officer, index) => (
                  <OfficerCard
                    key={officer.id}
                    officer={officer}
                    index={index}
                    delayMultiplier={
                      groupedOfficers.President.length +
                      groupedOfficers.Secretary.length
                    }
                    roleTag="Treasurer"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Committee Members Section */}
          {groupedOfficers["Committee Member"].length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-[#214A27] mb-3 text-center">
                Committee Members
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4 place-items-center max-w-6xl mx-auto">
                {groupedOfficers["Committee Member"].map((officer, index) => (
                  <OfficerCard
                    key={officer.id}
                    officer={officer}
                    index={index}
                    delayMultiplier={
                      groupedOfficers.President.length +
                      groupedOfficers.Secretary.length +
                      groupedOfficers["Honorary Treasurer"].length
                    }
                    roleTag="Committee"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default ClubOfficersPage
