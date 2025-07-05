import { PageSkeleton, SkeletonText } from "./SkeletonElements"
import CourseCardSkeleton from "../courses/courseCardSkeleton"

const CoursesPageSkeleton = () => {
  return (
    <PageSkeleton>
      <div className="bg-[#D9D9D9] mb-8">
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

      <div className="bg-[#D9D9D9]">
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="courses-grid">
            {Array(6)
              .fill()
              .map((_, index) => (
                <CourseCardSkeleton key={index} />
              ))}
          </div>
        </div>
      </div>
    </PageSkeleton>
  )
}

export default CoursesPageSkeleton
