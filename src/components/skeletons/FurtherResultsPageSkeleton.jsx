import { SkeletonText, SkeletonRect } from "./SkeletonElements"

const FurtherResultsPageSkeleton = () => {
  return (
    <div className="page-container">
      <div className="content-card">
        {/* Header section */}
        <header className="event-header">
          <SkeletonText width="50%" height="2rem" className="mb-3" />
          <SkeletonText width="30%" height="1.25rem" className="mb-2" />
          <SkeletonText width="20%" height="1rem" />
        </header>

        {/* Event review */}
        <div className="expandable-text-container">
          <div className="expandable-text-wrapper">
            <div className="expandable-text expandable-text-collapsed">
              <SkeletonText className="mb-1" />
              <SkeletonText className="mb-1" />
              <SkeletonText className="mb-1" />
              <SkeletonText width="90%" />
            </div>
            <SkeletonText width="80px" height="1rem" className="mt-2" />
          </div>
        </div>

        {/* Tabs navigation */}
        <nav className="tabs-navigation">
          <div className="flex space-x-6">
            {Array(3)
              .fill()
              .map((_, i) => (
                <SkeletonRect key={i} className="w-24 h-10 rounded" />
              ))}
          </div>
        </nav>

        {/* Results tables */}
        <main>
          <SkeletonText width="30%" height="1.5rem" className="mb-4" />

          <div className="results-table-container mb-8">
            <div className="w-full">
              {/* Table header */}
              <div className="bg-[#214A27] p-3 text-white">
                <div className="flex">
                  {Array(4)
                    .fill()
                    .map((_, i) => (
                      <div
                        key={i}
                        className={`${i === 0 ? "w-20" : "flex-1"} px-2`}>
                        <SkeletonText height="1rem" />
                      </div>
                    ))}
                </div>
              </div>

              {/* Table rows */}
              {Array(5)
                .fill()
                .map((_, rowIndex) => (
                  <div
                    key={rowIndex}
                    className={`flex p-3 ${
                      rowIndex % 2 === 0 ? "bg-[#D9D9D9]" : "bg-white"
                    }`}>
                    {Array(4)
                      .fill()
                      .map((_, colIndex) => (
                        <div
                          key={colIndex}
                          className={`${
                            colIndex === 0 ? "w-20" : "flex-1"
                          } px-2`}>
                          <SkeletonText height="1rem" />
                        </div>
                      ))}
                  </div>
                ))}
            </div>
          </div>

          <div className="section-divider"></div>

          <SkeletonText width="35%" height="1.5rem" className="mb-4" />

          {/* Button section for amateur tabs */}
          <div className="bg-[#17331B] h-[50px] flex mb-4">
            {Array(3)
              .fill()
              .map((_, i) => (
                <div
                  key={i}
                  className="flex-1 flex items-center justify-center border-r border-gray-400">
                  <SkeletonRect className="w-24 h-5" />
                </div>
              ))}
          </div>

          <div className="results-table-container">
            <div className="w-full">
              {/* Table header */}
              <div className="bg-[#214A27] p-3 text-white">
                <div className="flex">
                  {Array(4)
                    .fill()
                    .map((_, i) => (
                      <div
                        key={i}
                        className={`${i === 0 ? "w-20" : "flex-1"} px-2`}>
                        <SkeletonText height="1rem" />
                      </div>
                    ))}
                </div>
              </div>

              {/* Table rows */}
              {Array(10)
                .fill()
                .map((_, rowIndex) => (
                  <div
                    key={rowIndex}
                    className={`flex p-3 ${
                      rowIndex % 2 === 0 ? "bg-[#D9D9D9]" : "bg-white"
                    }`}>
                    {Array(4)
                      .fill()
                      .map((_, colIndex) => (
                        <div
                          key={colIndex}
                          className={`${
                            colIndex === 0 ? "w-20" : "flex-1"
                          } px-2`}>
                          <SkeletonText height="1rem" />
                        </div>
                      ))}
                  </div>
                ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default FurtherResultsPageSkeleton
