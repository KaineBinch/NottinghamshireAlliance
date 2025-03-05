const CourseCardSkeleton = () => {
  return (
    <>
      <div className="flex">
        {/* Left side - Image skeleton with wave effect */}
        <div className="relative flex w-2/5 h-50 md:h-60 bg-gray-300 overflow-hidden">
          {/* The wave effect overlay */}
          <div className="absolute inset-0 skeleton-wave"></div>
        </div>

        {/* Right side - Content skeletons */}
        <div className="flex flex-col w-3/5 text-start pl-5 md:pl-10 justify-center">
          {/* Name skeleton */}
          <div className="h-7 bg-gray-300 rounded w-3/4 my-4 overflow-hidden relative">
            <div className="absolute inset-0 skeleton-wave"></div>
          </div>

          {/* Address skeleton */}
          <div className="h-5 bg-gray-300 rounded w-4/5 mb-4 overflow-hidden relative">
            <div className="absolute inset-0 skeleton-wave"></div>
          </div>

          {/* Contact and button row */}
          <div className="flex items-center justify-between">
            {/* Phone skeleton */}
            <div className="h-5 bg-gray-300 rounded w-1/3 overflow-hidden relative">
              <div className="absolute inset-0 skeleton-wave"></div>
            </div>

            {/* Visit button skeleton */}
            <div className="h-9 bg-gray-300 rounded w-20 overflow-hidden relative">
              <div className="absolute inset-0 skeleton-wave"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Divider skeleton */}
      <hr className="my-4 border-[#A0A0A0] ml-auto w-2/4 md:mr-8 mr-2" />
    </>
  )
}

export default CourseCardSkeleton
