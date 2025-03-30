import HomePageHeader from "./homepageHeader.jsx"
import ResultsHighlightCard from "./resultsHighlightCard.jsx"

const ResultsSection = () => {
  return (
    <>
      <div className="bg-[#d9d9d9]">
        <HomePageHeader
          title="Results"
          subtext="View the latest competition results and see who topped the leaderboards."
          btnName="Results"
          btnStyle="text-white bg-[#214A27]"
          page="results"
        />

        <div className="flex justify-center w-full px-4 pb-8">
          <ResultsHighlightCard />
        </div>
      </div>
    </>
  )
}
export default ResultsSection
