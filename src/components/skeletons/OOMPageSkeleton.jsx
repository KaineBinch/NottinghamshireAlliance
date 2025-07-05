import {
  PageSkeleton,
  SkeletonText,
  SkeletonOOMTable,
} from "./SkeletonElements"

const OOMPageSkeleton = () => {
  return (
    <PageSkeleton>
      <div className="bg-[#d9d9d9]">
        <div className="max-w-5xl mx-auto py-5 px-4 sm:px-6 lg:px-8 text-start">
          <div className="space-y-3">
            <SkeletonText width="90%" className="mb-1" />
            <SkeletonText width="85%" className="mb-1" />
            <SkeletonText width="40%" />
          </div>
          <div className="space-y-3 mt-6">
            <SkeletonText width="80%" className="mb-1" />
            <SkeletonText width="70%" />
          </div>
        </div>
      </div>

      <div className="results-container mt-8">
        <SkeletonOOMTable rows={15} />
      </div>
    </PageSkeleton>
  )
}

export default OOMPageSkeleton
