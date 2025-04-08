import HomePageHeader from "./homepageHeader"

const OOMSectionSkeleton = () => {
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
          {/* Table header skeleton */}
          <div className="bg-[#17331B] h-[50px] flex">
            {Array(4)
              .fill()
              .map((_, i) => (
                <div
                  key={i}
                  className="flex-1 px-2 flex items-center justify-center">
                  <div className="h-4 w-20 bg-gray-300 relative overflow-hidden">
                    <div className="absolute inset-0 skeleton-wave"></div>
                  </div>
                </div>
              ))}
          </div>

          {/* Table header row */}
          <div className="bg-[#D9D9D9] flex p-2 border-b border-gray-400">
            <div className="w-16 px-2">
              <div className="h-4 bg-gray-300 relative overflow-hidden">
                <div className="absolute inset-0 skeleton-wave"></div>
              </div>
            </div>
            <div className="flex-1 px-2">
              <div className="h-4 bg-gray-300 relative overflow-hidden">
                <div className="absolute inset-0 skeleton-wave"></div>
              </div>
            </div>
            <div className="flex-1 px-2">
              <div className="h-4 bg-gray-300 relative overflow-hidden">
                <div className="absolute inset-0 skeleton-wave"></div>
              </div>
            </div>
            <div className="w-32 px-2">
              <div className="h-4 bg-gray-300 relative overflow-hidden">
                <div className="absolute inset-0 skeleton-wave"></div>
              </div>
            </div>
          </div>

          {/* Table rows */}
          {Array(12)
            .fill()
            .map((_, i) => (
              <div
                key={i}
                className={`flex p-2 border-b border-gray-300 ${
                  i % 2 === 0 ? "bg-gray-100" : "bg-white"
                }`}>
                <div className="w-16 px-2">
                  <div className="h-4 bg-gray-300 relative overflow-hidden">
                    <div className="absolute inset-0 skeleton-wave"></div>
                  </div>
                </div>
                <div className="flex-1 px-2">
                  <div className="h-4 bg-gray-300 relative overflow-hidden">
                    <div className="absolute inset-0 skeleton-wave"></div>
                  </div>
                </div>
                <div className="flex-1 px-2">
                  <div className="h-4 bg-gray-300 relative overflow-hidden">
                    <div className="absolute inset-0 skeleton-wave"></div>
                  </div>
                </div>
                <div className="w-32 px-2">
                  <div className="h-4 bg-gray-300 relative overflow-hidden">
                    <div className="absolute inset-0 skeleton-wave"></div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  )
}

export default OOMSectionSkeleton
