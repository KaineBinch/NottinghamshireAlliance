import PageHeader from "../components/pageHeader"
import { MODELS, QUERIES } from "../constants/api"
import useFetch from "../utils/hooks/useFetch"
import { queryBuilder } from "../utils/queryBuilder"
import "./ClubOfficersPage.css"

const ClubOfficersPage = () => {
  const query = queryBuilder(MODELS.clubOfficers, QUERIES.officerQuery)

  const { isLoading, isError, data, error } = useFetch(query)

  if (isLoading) {
    return <p className="loading-container"></p>
  } else if (isError) {
    console.error("Error:", error)
    return <p className="error-container">Something went wrong...</p>
  }

  const president =
    data?.data?.filter((officer) => officer.Positions === "President") || []
  const secretary =
    data?.data?.filter((officer) => officer.Positions === "Secretary") || []
  const committeeMembers =
    data?.data?.filter((officer) => officer.Positions === "Committee Member") ||
    []

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
              <div key={officer.id} className="officer-item">
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
              <div key={officer.id} className="officer-item">
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
              <div key={officer.id} className="secretary-item">
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
