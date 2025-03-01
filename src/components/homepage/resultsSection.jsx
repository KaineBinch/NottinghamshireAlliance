import HomePageHeader from "./homepageHeader.jsx"
import { MODELS, QUERIES } from "../../constants/api.js"
import useFetch from "../../utils/hooks/useFetch.js"
import { queryBuilder } from "../../utils/queryBuilder.js"

const ResultsSection = () => {
  const query = queryBuilder(MODELS.events, QUERIES.resultsQuery)
  const { isLoading, isError, data, error } = useFetch(query)

  if (isLoading) {
    return <p className="pt-[85px]">Loading...</p>
  } else if (isError) {
    console.error("Error:", error)
    return <p className="pt-[85px]">Something went wrong...</p>
  }

  return (
    <>
      <div className="bg-[#d9d9d9]">
        <HomePageHeader
          title="Results"
          subtext=""
          btnName="Results"
          btnStyle="text-white bg-[#214A27]"
          page="results"
        />
      </div>
    </>
  )
}
export default ResultsSection
