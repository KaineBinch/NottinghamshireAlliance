import { PageSkeleton, SkeletonText, SkeletonRect } from "./SkeletonElements"
import FixturesListViewSkeleton from "../fixtures/fixturesListViewSkeleton"
import FixtureCardSkeleton from "../fixtures/fixtureCardSkeleton"

const FixturesPageSkeleton = ({ isListView = true }) => {
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

      <div className="view-toggle-container my-4">
        <SkeletonRect className="w-40 h-10 rounded-lg" />
      </div>

      {isListView ? (
        <FixturesListViewSkeleton />
      ) : (
        <div className="card-view-container">
          <div className="cards-container">
            <div className="card-grid">
              {Array(6)
                .fill()
                .map((_, index) => (
                  <div key={index} className="flex justify-center w-full">
                    <FixtureCardSkeleton />
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </PageSkeleton>
  )
}

export default FixturesPageSkeleton
