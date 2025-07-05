const FixtureCardSkeleton = () => {
  return (
    <div className="fixture-card p-4 bg-[#214A27] shadow-lg rounded-md flex justify-center items-center">
      <div
        className="fixture-card-inner bg-[#D9D9D9] text-black border border-black relative"
        style={{
          width: "100%",
          minHeight: "300px",
          maxWidth: "350px",
        }}>
        {/* Image placeholder */}
        <div className="relative">
          <div className="w-full h-[250px] bg-gray-300 relative overflow-hidden">
            <div className="absolute inset-0 skeleton-wave"></div>
          </div>
        </div>

        {/* Content placeholders */}
        <div className="flex-1 flex flex-col py-1 text-center place-content-evenly min-h-[175px]">
          {/* Name */}
          <div className="px-2 -mt-1 h-8 mx-auto w-3/4 bg-gray-300 mb-2 relative overflow-hidden">
            <div className="absolute inset-0 skeleton-wave"></div>
          </div>

          {/* Address */}
          <div className="flex w-full">
            <div className="flex flex-col justify-center w-full pl-4 px-2">
              <div className="h-5 bg-gray-300 w-11/12 relative overflow-hidden">
                <div className="absolute inset-0 skeleton-wave"></div>
              </div>
            </div>
            <div className="flex-shrink-0 flex items-end justify-end pr-2 lg:hidden max-w-[60px] min-w-[60px]">
              <div className="w-10 h-10 rounded-full bg-gray-300 relative overflow-hidden">
                <div className="absolute inset-0 skeleton-wave"></div>
              </div>
            </div>
          </div>

          {/* Competition */}
          <div className="h-6 bg-gray-300 w-1/2 mx-auto mt-2 relative overflow-hidden">
            <div className="absolute inset-0 skeleton-wave"></div>
          </div>
        </div>

        {/* Date card */}
        <div className="absolute right-0 top-0 mt-4 mr-4 bg-[#D9D9D9] h-[115px] w-[115px] flex flex-col items-center justify-center space-y-2">
          <div className="h-4 bg-gray-300 w-1/2 relative overflow-hidden mb-1">
            <div className="absolute inset-0 skeleton-wave"></div>
          </div>
          <div className="h-5 bg-gray-300 w-1/3 relative overflow-hidden mb-1">
            <div className="absolute inset-0 skeleton-wave"></div>
          </div>
          <div className="h-4 bg-gray-300 w-3/4 relative overflow-hidden">
            <div className="absolute inset-0 skeleton-wave"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FixtureCardSkeleton
