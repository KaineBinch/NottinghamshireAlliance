import { SkeletonCard, SkeletonRect, SkeletonText } from "./SkeletonElements"

const HomePageSkeleton = () => {
  return (
    <div className="flex flex-col w-full">
      {/* Hero section */}
      <div className="w-full h-[40svh] bg-gray-300 relative">
        <div className="absolute inset-0 skeleton-wave"></div>
        {/* Weather skeleton at bottom */}
        <div className="absolute bottom-0 w-full flex justify-center">
          <div className="flex bg-black bg-opacity-30 p-2 rounded">
            {Array(3)
              .fill()
              .map((_, i) => (
                <div key={i} className="mx-4 flex items-center">
                  <SkeletonRect className="w-6 h-6 rounded-full" />
                  <div className="ml-2">
                    <SkeletonText
                      width="50px"
                      height="0.75rem"
                      className="mb-1"
                    />
                    <SkeletonText width="30px" height="0.75rem" />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Welcome section */}
      <div className="bg-[#D9D9D9] flex place-content-center">
        <div className="text-center px-5 py-[50px] max-w-5xl w-full">
          <SkeletonText width="70%" height="2.5rem" className="mx-auto" />
          <div className="py-[25px]">
            <SkeletonText className="mx-auto mb-2" />
            <SkeletonText className="mx-auto mb-2" />
            <SkeletonText className="mx-auto mb-2" />
            <SkeletonText width="90%" className="mx-auto" />
          </div>
          <div className="flex justify-center">
            <SkeletonRect className="w-[125px] h-[38px] mx-2" />
            <SkeletonRect className="w-[125px] h-[38px] mx-2" />
          </div>
        </div>
      </div>

      {/* Scroller skeleton */}
      <div className="flex flex-col items-center bg-[#214A27] h-[75px]">
        <hr className="border-black w-full" />
        <div className="h-[75px] w-full overflow-hidden flex items-center">
          <div className="flex animate-pulse">
            {Array(8)
              .fill()
              .map((_, i) => (
                <div
                  key={i}
                  className="h-[50px] w-[100px] bg-white bg-opacity-20 mx-5"></div>
              ))}
          </div>
        </div>
        <hr className="border-black w-full" />
      </div>

      {/* Tee Times Section Skeleton */}
      <div className="items-center justify-center flex flex-col w-full mx-auto max-w-5xl mb-5 px-4">
        <div className="text-start text-black w-full pt-[35px] pb-[50px]">
          <SkeletonText width="30%" height="2rem" className="mb-4" />
          <div className="flex justify-between">
            <div className="w-3/4">
              <SkeletonText width="90%" className="mb-1" />
              <SkeletonText width="70%" />
            </div>
            <SkeletonRect className="w-[125px] h-[38px]" />
          </div>
        </div>

        <SkeletonRect className="w-full h-12 mb-4" />

        <div className="w-full">
          <SkeletonRect className="w-full h-[200px] border-[6px] border-[#214A27] p-4 rounded-md max-w-md mx-auto" />
        </div>
      </div>

      <hr className="border-black" />

      {/* Results Section Skeleton */}
      <div className="bg-[#d9d9d9]">
        <div className="text-start text-black max-w-5xl mx-auto w-full px-5 pt-[35px] pb-[50px]">
          <SkeletonText width="20%" height="2rem" className="mb-4" />
          <div className="flex justify-between">
            <div className="w-3/4">
              <SkeletonText width="80%" />
            </div>
            <SkeletonRect className="w-[125px] h-[38px]" />
          </div>
        </div>
      </div>

      <hr className="border-black" />

      {/* OOM Section Skeleton */}
      <div className="max-w-5xl mx-auto w-full px-4 pt-[35px] pb-[50px]">
        <div className="text-start mb-8">
          <SkeletonText width="40%" height="2rem" className="mb-4" />
          <div className="flex justify-between">
            <div className="w-3/4">
              <SkeletonText width="90%" />
            </div>
            <SkeletonRect className="w-[125px] h-[38px]" />
          </div>
        </div>

        {/* OOM Table skeleton */}
        <div className="bg-white shadow border border-gray-300">
          <div className="h-12 bg-[#17331B]"></div>
          <div className="h-10 bg-[#D9D9D9] border-b border-gray-300"></div>
          {Array(8)
            .fill()
            .map((_, i) => (
              <div
                key={i}
                className={`h-10 ${
                  i % 2 === 0 ? "bg-white" : "bg-gray-100"
                } border-b border-gray-300`}></div>
            ))}
        </div>
      </div>

      <hr className="border-black" />

      {/* Courses Section Skeleton */}
      <div className="bg-[#d9d9d9]">
        <div className="text-start text-black max-w-5xl mx-auto w-full px-5 pt-[35px] pb-[50px]">
          <SkeletonText width="20%" height="2rem" className="mb-4" />
          <div className="flex justify-between">
            <div className="w-3/4">
              <SkeletonText width="90%" />
            </div>
            <SkeletonRect className="w-[125px] h-[38px]" />
          </div>
        </div>
      </div>

      <hr className="border-black" />

      {/* Fixtures Section Skeleton */}
      <div className="max-w-5xl mx-auto w-full px-4 pt-[35px] pb-[10px]">
        <div className="text-start mb-4">
          <SkeletonText width="20%" height="2rem" className="mb-4" />
          <div className="flex justify-between">
            <div className="w-3/4">
              <SkeletonText width="90%" />
            </div>
            <SkeletonRect className="w-[125px] h-[38px]" />
          </div>
        </div>

        <div className="mb-10">
          <SkeletonText width="30%" height="1.5rem" className="mb-4 mx-auto" />

          <div className="w-auto max-w-5xl mx-auto mb-10">
            <div className="p-4 bg-[#214A27] shadow-lg rounded-md">
              <div className="flex flex-col bg-[#D9D9D9] border border-black relative min-h-[300px]">
                <div className="w-full h-[250px] bg-gray-300 relative">
                  <div className="absolute inset-0 skeleton-wave"></div>
                </div>
                <div className="flex-1 flex flex-col p-3">
                  <SkeletonText
                    width="40%"
                    height="1.5rem"
                    className="mx-auto mb-2"
                  />
                  <SkeletonText width="60%" className="mx-auto mb-4" />
                  <SkeletonText width="70%" className="mx-auto" />
                </div>
              </div>
            </div>
          </div>

          <SkeletonText width="30%" height="1.5rem" className="mb-6 mx-auto" />

          <div className="w-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array(2)
              .fill()
              .map((_, i) => (
                <div key={i} className="p-4 bg-[#214A27] shadow-lg rounded-md">
                  <div className="flex flex-col bg-[#D9D9D9] border border-black relative min-h-[300px]">
                    <div className="w-full h-[250px] bg-gray-300 relative">
                      <div className="absolute inset-0 skeleton-wave"></div>
                    </div>
                    <div className="flex-1 flex flex-col p-3">
                      <SkeletonText
                        width="40%"
                        height="1.5rem"
                        className="mx-auto mb-2"
                      />
                      <SkeletonText width="60%" className="mx-auto mb-4" />
                      <SkeletonText width="70%" className="mx-auto" />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePageSkeleton
