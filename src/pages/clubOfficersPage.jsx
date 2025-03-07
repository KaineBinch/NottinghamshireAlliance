import PageHeader from "../components/pageHeader"
import { MODELS, QUERIES } from "../constants/api"
import useFetch from "../utils/hooks/useFetch"
import { queryBuilder } from "../utils/queryBuilder"

const ClubOfficersPage = () => {
  const query = queryBuilder(MODELS.clubOfficers, QUERIES.officerQuery)

  const { isLoading, isError, data, error } = useFetch(query)

  if (isLoading) {
    return <p className="pt-[85px]"></p>
  } else if (isError) {
    console.error("Error:", error)
    return <p className="pt-[85px]">Something went wrong...</p>
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
      <div className="bg-[#d9d9d9]">
        <div className="max-w-5xl mx-auto py-5 px-4 sm:px-6 lg:px-8 text-start">
          <p>Please see below this years committee members</p>
        </div>
        <hr className="border-black" />
      </div>
      <div className="max-w-5xl mx-auto py-5 px-4 sm:px-6 lg:px-8 text-black">
        {/* Render President */}
        {president.length > 0 && (
          <div>
            <p className="font-semibold text-2xl pt-5">President</p>
            {president.map((officer) => (
              <div key={officer.id} className="py-2">
                <p>
                  <span className="font-semibold pr-5">{officer.Name}</span>
                  <span className="inline">
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
            <p className="font-semibold text-2xl pt-10">Committee Members</p>
            {committeeMembers.map((officer) => (
              <div key={officer.id} className="py-2">
                <p>
                  <span className="font-semibold pr-5">{officer.Name}</span>
                  <span className="inline">
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
            <p className="font-semibold text-2xl pt-10">Secretary</p>
            {secretary.map((officer) => (
              <div key={officer.id} className="py-2 pb-10">
                <p>
                  <span className="font-semibold pr-5">{officer.Name}</span>
                  <span className="inline">
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
