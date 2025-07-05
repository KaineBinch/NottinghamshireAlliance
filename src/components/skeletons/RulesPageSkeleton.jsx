import { PageSkeleton, SkeletonText, SkeletonRect } from "./SkeletonElements"

const RulesPageSkeleton = () => {
  return (
    <PageSkeleton>
      <div className="bg-[#D9D9D9]">
        <div className="content-container">
          <SkeletonText width="60%" height="2rem" className="mb-3" />
          <SkeletonText width="40%" height="1.25rem" className="mb-6" />
          <SkeletonText width="50%" height="1.5rem" className="mb-8" />

          <hr />

          {/* Rules section */}
          {Array(5)
            .fill()
            .map((_, index) => (
              <div key={index} className="collapse-item mb-2">
                <div className="collapse-title flex items-center">
                  <SkeletonText width="80%" height="1.25rem" />
                  <div className="ml-auto">
                    <SkeletonRect className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))}

          <h2 className="rules-section-header">
            <SkeletonText width="50%" height="1.5rem" />
          </h2>

          {/* Conditions section */}
          {Array(5)
            .fill()
            .map((_, index) => (
              <div key={index} className="collapse-item mb-2">
                <div className="collapse-title flex items-center">
                  <SkeletonText width="80%" height="1.25rem" />
                  <div className="ml-auto">
                    <SkeletonRect className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </PageSkeleton>
  )
}

export default RulesPageSkeleton
