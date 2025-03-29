import { PageSkeleton, SkeletonText, SkeletonRect } from "./SkeletonElements"

const ResultsCardSkeleton = () => {
  return (
    <div className="p-4 bg-[#214A27] shadow-lg rounded-md max-w-[350px]">
      <div className="flex flex-col bg-[#D9D9D9] text-black border border-black relative">
        <div className="relative">
          <div className="w-full h-[250px] bg-gray-300 relative">
            <div className="absolute inset-0 skeleton-wave"></div>
          </div>
        </div>

        <div className="bg-[#D9D9D9]">
          <div className="flex flex-col items-center text-center px-2 py-2">
            <SkeletonText width="70%" height="1.5rem" className="mb-2" />
            <SkeletonText width="60%" className="mb-2" />
            <SkeletonText width="40%" />
          </div>
        </div>
      </div>
    </div>
  )
}

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
