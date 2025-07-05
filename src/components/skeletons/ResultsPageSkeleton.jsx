import { PageSkeleton, SkeletonText } from "./SkeletonElements"
import ResultsCardSkeleton from "../results/resultsCardSkeleton"

const ResultsPageSkeleton = () => {
  return (
    <PageSkeleton>
      <div className="bg-[#D9D9D9]">
        <div className="max-w-5xl mx-auto py-5 px-4 sm:px-6 lg:px-8 text-start">
          <SkeletonText width="90%" className="mb-1" />
          <SkeletonText width="60%" />
        </div>
      </div>

      <div className="results-wrapper">
        <div className="results-grid">
          {Array(6)
            .fill()
            .map((_, index) => (
              <ResultsCardSkeleton key={index} />
            ))}
        </div>
      </div>
    </PageSkeleton>
  )
}

export default ResultsPageSkeleton
