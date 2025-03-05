// components/FixtureCardSkeleton.jsx
const FixtureCardSkeleton = () => {
  return (
    <div className="p-4 bg-[#214A27] shadow-lg rounded-md">
      <div className="flex flex-col bg-[#D9D9D9] text-black border border-black relative w-[285px] h-[425px]">
        <div className="relative">
          {/* Image skeleton with wave effect - exact same dimensions */}
          <div className="w-full h-[250px] bg-gray-300 overflow-hidden relative">
            <div className="absolute inset-0 skeleton-wave"></div>
          </div>
        </div>

        <div className="flex-1 flex flex-col py-1 text-center place-content-evenly md:min-h-[175px] min-h-[185px]">
          {/* Club name skeleton - match font-bold text-3xl md:text-2xl */}
          <div className="px-2 -mt-1 h-10 bg-gray-300 mx-auto w-4/5 rounded overflow-hidden relative">
            <div className="absolute inset-0 skeleton-wave"></div>
          </div>

          <div className="flex w-full">
            <div className="flex flex-col justify-center w-full pl-4 px-2">
              {/* Address skeleton */}
              <div className="h-5 bg-gray-300 w-3/4 rounded overflow-hidden relative">
                <div className="absolute inset-0 skeleton-wave"></div>
              </div>
            </div>
            <div className="flex-shrink-0 flex items-end justify-end pr-2 lg:hidden max-w-[60px] min-w-[60px]">
              {/* Calendar button skeleton */}
              <div className="h-10 w-10 bg-gray-300 rounded-sm overflow-hidden relative">
                <div className="absolute inset-0 skeleton-wave"></div>
              </div>
            </div>
          </div>

          {/* Competition type skeleton */}
          <div className="flex items-end justify-center">
            <div className="h-6 bg-gray-300 w-3/4 rounded overflow-hidden relative">
              <div className="absolute inset-0 skeleton-wave"></div>
            </div>
          </div>
        </div>

        {/* Date box skeleton - exact same dimensions and position */}
        <div className="absolute right-0 top-0 mt-4 mr-4 bg-[#D9D9D9] h-[115px] w-[115px] flex flex-col items-center justify-center space-y-2 overflow-hidden">
          {/* Day name placeholder */}
          <div className="flex flex-col items-center justify-center w-full">
            <div className="h-6 bg-gray-300 w-3/4 rounded my-1 overflow-hidden relative">
              <div className="absolute inset-0 skeleton-wave"></div>
            </div>

            {/* Day number placeholder */}
            <div className="h-6 bg-gray-300 w-1/4 rounded my-1 overflow-hidden relative">
              <div className="absolute inset-0 skeleton-wave"></div>
            </div>

            {/* Month and year placeholder */}
            <div className="h-6 bg-gray-300 w-3/4 rounded my-1 overflow-hidden relative">
              <div className="absolute inset-0 skeleton-wave"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FixtureCardSkeleton
