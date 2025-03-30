import PageHeader from "../components/pageHeader"
import { MODELS, QUERIES } from "../constants/api"
import useFetch from "../utils/hooks/useFetch"
import { queryBuilder } from "../utils/queryBuilder"
import { ClubOfficersPageSkeleton } from "../components/skeletons"
import { useState, useEffect } from "react"
import "./clubOfficersPage.css"

const ClubOfficersPage = () => {
  const query = queryBuilder(MODELS.clubOfficers, QUERIES.officerQuery)
  const { isLoading, isError, data, error } = useFetch(query)
  const [animatedItems, setAnimatedItems] = useState([])

  // Gradually show officer items after data loads
  useEffect(() => {
    if (!isLoading && data?.data) {
      // Reset animation state
      setAnimatedItems([])

      // Animate items in one by one
      const officers = [...data.data]
      let index = 0

      const animationInterval = setInterval(() => {
        if (index < officers.length) {
          setAnimatedItems((prev) => [...prev, officers[index].id])
          index++
        } else {
          clearInterval(animationInterval)
        }
      }, 100)

      return () => clearInterval(animationInterval)
    }
  }, [isLoading, data])

  if (isLoading) {
    return <ClubOfficersPageSkeleton />
  } else if (isError) {
    console.error("Error:", error)
    return (
      <div className="error-container">
        <p>Something went wrong loading the club officers information.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-[#214A27] text-white px-4 py-2 rounded">
          Try Again
        </button>
      </div>
    )
  }

  const president =
    data?.data?.filter((officer) => officer.Positions === "President") || []
  const secretary =
    data?.data?.filter((officer) => officer.Positions === "Secretary") || []
  const committeeMembers =
    data?.data?.filter((officer) => officer.Positions === "Committee Member") ||
    []

  // Animation classes
  const getAnimationClass = (officerId) => {
    return animatedItems.includes(officerId)
      ? "opacity-100 translate-y-0 transition-all duration-500 ease-in-out"
      : "opacity-0 translate-y-4"
  }

  return (
    <>
      <PageHeader title="Club Officers" />
      <hr className="border-black" />
      <div className="description-section">
        <div className="description-container">
          <p>Please see below this years committee members</p>
        </div>
        <hr className="border-black" />
      </div>
      <div className="officers-container">
        {/* Render President */}
        {president.length > 0 && (
          <div>
            <p className="president-title">President</p>
            {president.map((officer) => (
              <div
                key={officer.id}
                className={`officer-item ${getAnimationClass(officer.id)}`}>
                <p>
                  <span className="officer-name">{officer.Name}</span>
                  <span className="officer-club">
                    {officer.golf_club?.clubName} Golf Club
                  </span>
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Render Committee Members */}
        {committeeMembers.length > 0 && (
          <div>
            <p className="committee-title">Committee Members</p>
            {committeeMembers.map((officer) => (
              <div
                key={officer.id}
                className={`officer-item ${getAnimationClass(officer.id)}`}>
                <p>
                  <span className="officer-name">{officer.Name}</span>
                  <span className="officer-club">
                    {officer.golf_club?.clubName} Golf Club
                  </span>
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Render Secretary */}
        {secretary.length > 0 && (
          <div>
            <p className="secretary-title">Secretary</p>
            {secretary.map((officer) => (
              <div
                key={officer.id}
                className={`secretary-item ${getAnimationClass(officer.id)}`}>
                <p>
                  <span className="officer-name">{officer.Name}</span>
                  <span className="officer-club">
                    {officer.golf_club?.clubName} Golf Club
                  </span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default ClubOfficersPage
