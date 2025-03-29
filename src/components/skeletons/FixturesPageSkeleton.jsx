import { PageSkeleton, SkeletonText, SkeletonRect } from "./SkeletonElements"
import FixturesListViewSkeleton from "../fixtures/fixturesListViewSkeleton"

const FixturesPageSkeleton = ({ isListView = true }) => {
  return (
    <PageSkeleton>
      <div className="bg-[#d9d9d9]">
        <div className="max-w-5xl mx-auto py-5 px-4 sm:px-6 lg:px-8 text-start">
          <div className="space-y-3">
            <SkeletonText width="90%" className="mb-1" />
            <SkeletonText width="85%" className="mb-1" />
            <SkeletonText width="40%" />
          </div>
          <div className="space-y-3 mt-6">
            <SkeletonText width="80%" className="mb-1" />
            <SkeletonText width="70%" />
          </div>
        </div>
      </div>

      <div className="view-toggle-container my-4">
        <SkeletonRect className="w-40 h-10 rounded-lg" />
      </div>

      {isListView ? (
        <FixturesListViewSkeleton />
      ) : (
        <div className="w-full pt-8">
          <div className="flex flex-col items-center">
            <div className="w-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-5">
              {Array(6)
                .fill()
                .map((_, index) => (
                  <div
                    key={index}
                    className="p-4 bg-[#214A27] shadow-lg rounded-md">
                    <div className="flex flex-col bg-[#D9D9D9] text-black border border-black relative min-h-[300px]">
                      <div className="w-full h-[250px] bg-gray-300 relative">
                        <div className="absolute inset-0 skeleton-wave"></div>
                      </div>

                      <div className="flex-1 flex flex-col py-1 text-center place-content-evenly md:min-h-[175px] min-h-[185px]">
                        <SkeletonText
                          width="70%"
                          height="1.5rem"
                          className="mx-auto mb-2"
                        />
                        <div className="flex w-full">
                          <div className="flex flex-col justify-center w-full pl-4 px-2">
                            <SkeletonText width="90%" />
                          </div>
                          <div className="flex-shrink-0 flex items-end justify-end pr-2 lg:hidden max-w-[60px] min-w-[60px]">
                            <SkeletonRect className="w-10 h-10 rounded-full" />
                          </div>
                        </div>
                        <SkeletonText width="60%" className="mx-auto mt-2" />
                      </div>

                      <div className="absolute right-0 top-0 mt-4 mr-4 bg-[#D9D9D9] h-[115px] w-[115px] flex flex-col items-center justify-center">
                        <SkeletonText width="60%" className="mb-1" />
                        <SkeletonText width="40%" className="mb-1" />
                        <SkeletonText width="80%" />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </PageSkeleton>
  )
}

export default FixturesPageSkeleton
