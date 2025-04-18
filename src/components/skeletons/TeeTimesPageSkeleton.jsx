import { PageSkeleton, SkeletonText, SkeletonRect } from "./SkeletonElements"

const TeeTimesTableSkeleton = () => {
  return (
    <div className="teetimes-container">
      <div className="search-filter-container">
        <div className="filter-container">
          <div className="search-group">
            <SkeletonRect className="h-12 w-full" />
          </div>
          <div>
            <SkeletonRect className="h-12 w-full mt-4" />
          </div>
        </div>
      </div>

      <div className="teetimes-grid">
        {Array(8)
          .fill()
          .map((_, index) => (
            <div key={index} className="teetime-card">
              <div className="teetime-header">
                <SkeletonText width="40%" height="1.2rem" className="mx-auto" />
              </div>
              <div className="teetime-body">
                <div className="players-grid">
                  {Array(4)
                    .fill()
                    .map((_, playerIndex) => (
                      <div key={playerIndex} className="player-container">
                        <SkeletonText width="90%" className="mb-1" />
                        <SkeletonText width="40%" height="0.75rem" />
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

const TeeTimesListSkeleton = () => {
  return (
    <div className="list-view-container">
      <div className="list-view-grid">
        {Array(6)
          .fill()
          .map((_, index) => (
            <div key={index} className="club-card">
              <div className="club-header">
                <SkeletonText width="70%" height="1.2rem" className="mx-auto" />
              </div>
              <div className="players-container">
                <ul>
                  {Array(5)
                    .fill()
                    .map((_, playerIndex) => (
                      <li key={playerIndex} className="player-item">
                        <SkeletonText width="80%" className="mb-2" />
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

const TeeTimesPageSkeleton = ({ isListView = false }) => {
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
            <SkeletonText width="60%" />
          </div>
          <div className="space-y-3 mt-6">
            <SkeletonText width="70%" />
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="justify-center items-center">
          <div>
            <SkeletonText width="40%" height="2rem" className="mb-2" />
            <SkeletonText width="60%" height="1.25rem" className="mb-2" />
          </div>
        </div>
        <div className="view-toggle-container">
          <SkeletonRect className="w-32 h-10 rounded-lg" />
        </div>
      </div>

      <div className="tee-times-container">
        <div className="tee-times-wrapper">
          <div className="tee-times-content">
            {isListView ? <TeeTimesListSkeleton /> : <TeeTimesTableSkeleton />}
          </div>
        </div>
      </div>
    </PageSkeleton>
  )
}

export default TeeTimesPageSkeleton
