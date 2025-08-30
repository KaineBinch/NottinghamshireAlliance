import HomePageHeader from "./homepageHeader"
import ResultsTable from "../results/resultsTable/resultsTable"
const OOMSection = () => {
  return (
    <>
      <div className="">
        <HomePageHeader
          title="Order Of Merit Standings"
          subtext="See the top 12 rankings at a glance, or click here for the complete standings."
          btnName="Order of Merit"
          btnStyle="text-white bg-[#214A27]"
          page="oom"
        />
        <div className="max-w-5xl -mt-8 w-full mx-auto px-4 sm:px-6 lg:px-8">
          {/* The dynamic ResultsTable handles its own loading states and API calls */}
          <ResultsTable limit={12} />
        </div>
      </div>
    </>
  )
}

export default OOMSection
