import { PageSkeleton, SkeletonText } from "./SkeletonElements"

const ClubOfficersPageSkeleton = () => {
  return (
    <PageSkeleton>
      <div className="description-section">
        <div className="description-container">
          <SkeletonText width="80%" />
        </div>
      </div>

      <div className="officers-container">
        {/* President section */}
        <div>
          <SkeletonText width="30%" height="1.5rem" className="mb-4" />
          {Array(1)
            .fill()
            .map((_, index) => (
              <div key={index} className="officer-item">
                <SkeletonText width="60%" className="mb-1" />
              </div>
            ))}
        </div>

        {/* Committee Members section */}
        <div className="mt-10">
          <SkeletonText width="40%" height="1.5rem" className="mb-4" />
          {Array(5)
            .fill()
            .map((_, index) => (
              <div key={index} className="officer-item">
                <SkeletonText width="60%" className="mb-1" />
              </div>
            ))}
        </div>

        {/* Secretary section */}
        <div className="mt-10">
          <SkeletonText width="25%" height="1.5rem" className="mb-4" />
          {Array(1)
            .fill()
            .map((_, index) => (
              <div key={index} className="secretary-item">
                <SkeletonText width="60%" className="mb-1" />
              </div>
            ))}
        </div>
      </div>
    </PageSkeleton>
  )
}

export default ClubOfficersPageSkeleton
