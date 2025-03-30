const ResultsCardSkeleton = () => {
  return (
    <div className="p-4 bg-[#214A27] shadow-lg rounded-md max-w-[350px] w-full mx-auto">
      <div className="flex flex-col bg-[#D9D9D9] text-black border border-black relative w-full">
        {/* Image placeholder */}
        <div className="relative">
          <div className="w-full h-[250px] bg-gray-300 relative overflow-hidden">
            <div className="absolute inset-0 skeleton-wave"></div>
          </div>
        </div>

        {/* Text section */}
        <div className="bg-[#D9D9D9] w-full">
          <div className="flex flex-col items-center text-center px-2 py-3">
            {/* Club name */}
            <div className="h-6 bg-gray-300 w-3/4 mb-3 relative overflow-hidden">
              <div className="absolute inset-0 skeleton-wave"></div>
            </div>

            {/* Competition */}
            <div className="h-5 bg-gray-300 w-2/3 mb-3 relative overflow-hidden">
              <div className="absolute inset-0 skeleton-wave"></div>
            </div>

            {/* Date */}
            <div className="h-5 bg-gray-300 w-1/3 relative overflow-hidden">
              <div className="absolute inset-0 skeleton-wave"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultsCardSkeleton
