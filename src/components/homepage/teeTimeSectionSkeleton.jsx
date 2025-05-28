import { SkeletonRect } from "../skeletons/SkeletonElements"
import HomePageHeader from "./homepageHeader.jsx"

const TeeTimeSectionSkeleton = () => {
  return (
    <div className="items-center justify-center flex flex-col w-full mx-auto max-w-5xl mb-5">
      {/* Use the actual HomePageHeader component instead of skeleton placeholders */}
      <HomePageHeader
        title="Order of Play"
        subtext="Check your tee time for upcoming events"
        btnName="Tee Times"
        btnStyle="text-black bg-white"
        page="teetimes"
      />

      {/* Search input skeleton */}
      <div className="flex justify-center w-full -mt-5 p-5">
        <SkeletonRect className="w-full h-12" />
      </div>

      {/* Tee time card skeleton */}
      <div className="flex flex-col w-full p-5 mx-auto items-center">
        <div className="bg-[#D9D9D9] border border-[#214A27] border-[6px] shadow-md p-4 rounded-md w-full max-w-md m-1">
          <div className="w-full flex justify-center items-center">
            <div className="flex flex-col w-2/3 items-start mb-4">
              <div className="h-7 bg-gray-300 w-3/4 mb-2 relative overflow-hidden">
                <div className="absolute inset-0 skeleton-wave"></div>
              </div>
              <div className="h-5 bg-gray-300 w-1/2 relative overflow-hidden">
                <div className="absolute inset-0 skeleton-wave"></div>
              </div>
            </div>
            <div className="flex justify-center items-center drop-shadow w-1/3 relative">
              <div className="h-[85px] w-[85px] bg-gray-300 relative overflow-hidden">
                <div className="absolute inset-0 skeleton-wave"></div>
              </div>
            </div>
          </div>
          <div className="h-6 bg-gray-300 w-2/3 mb-4 relative overflow-hidden">
            <div className="absolute inset-0 skeleton-wave"></div>
          </div>
          <div className="flex flex-col items-start text-base mt-4">
            <div className="h-5 bg-gray-300 w-1/4 mb-3 relative overflow-hidden">
              <div className="absolute inset-0 skeleton-wave"></div>
            </div>
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="ml-2 w-full mb-3">
                <div className="h-5 bg-gray-300 w-4/5 relative overflow-hidden">
                  <div className="absolute inset-0 skeleton-wave"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeeTimeSectionSkeleton
