import HomePageHeader from "./homepageHeader"
import ResultsTable from "../results/resultsTable/resultsTable"
import { results } from "../../constants/results"
import { transformResults } from "../../utils/transformResults"
import OOMSectionSkeleton from "./oomSectionSkeleton"
import { useState, useEffect } from "react"

const OOMSection = () => {
  const [isLoading, setIsLoading] = useState(true)
  const { rows, columns } = transformResults(results)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <OOMSectionSkeleton />
  }

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
          <ResultsTable columns={columns} rows={rows} limit={12} />
        </div>
      </div>
    </>
  )
}

export default OOMSection
