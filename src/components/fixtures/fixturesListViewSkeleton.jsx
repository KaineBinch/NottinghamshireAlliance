const FixturesListViewSkeleton = () => {
  const skeletonRows = Array(8).fill(0)

  return (
    <div className="w-full pt-8 px-2 sm:px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#214A27] h-[64px] w-auto font-semibold text-white text-center text-xs sm:text-sm">
              <tr className="[&>th]:px-2 [&>th]:sm:px-4 [&>th]:md:px-6 [&>th]:py-2 [&>th]:md:py-3 [&>th]:tracking-wider">
                <th className="skeleton-wave"></th>
                <th></th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody className="bg-[#D9D9D9] divide-y divide-gray-300">
              {skeletonRows.map((_, index) => (
                <tr
                  key={index}
                  className="[&>td]:px-2 [&>td]:sm:px-4 [&>td]:md:px-6 [&>td]:py-2 [&>td]:md:py-4">
                  <td className="text-center">
                    <div className="h-4 sm:h-5 bg-gray-300 rounded w-24 sm:w-40 mx-auto overflow-hidden relative">
                      <div className="absolute inset-0 skeleton-wave"></div>
                    </div>
                  </td>
                  <td className="text-center">
                    <div className="h-4 sm:h-5 bg-gray-300 rounded w-28 sm:w-52 mx-auto mb-1 sm:mb-2 overflow-hidden relative">
                      <div className="absolute inset-0 skeleton-wave"></div>
                    </div>
                    <div className="h-3 sm:h-4 bg-gray-300 rounded w-20 sm:w-40 mx-auto overflow-hidden relative hidden sm:block">
                      <div className="absolute inset-0 skeleton-wave"></div>
                    </div>
                  </td>
                  <td className="text-center">
                    <div className="h-4 sm:h-5 bg-gray-300 rounded w-20 sm:w-36 mx-auto overflow-hidden relative">
                      <div className="absolute inset-0 skeleton-wave"></div>
                    </div>
                  </td>
                  <td>
                    <div className="flex justify-center">
                      <div className="h-8 w-8 bg-gray-300 rounded overflow-hidden relative">
                        <div className="absolute inset-0 skeleton-wave"></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default FixturesListViewSkeleton
