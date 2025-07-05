import { PageSkeleton, SkeletonRect } from "./SkeletonElements"

const GalleryPageSkeleton = () => {
  return (
    <PageSkeleton>
      <div className="page-background">
        <div className="gallery-container">
          <div className="w-full flex justify-center">
            <div className="w-full max-w-3xl">
              {/* Gallery main image skeleton */}
              <div className="relative h-80 bg-gray-300 mb-4">
                <div className="absolute inset-0 skeleton-wave"></div>

                {/* Control buttons */}
                <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                  <SkeletonRect className="w-10 h-10 rounded-full" />
                </div>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <SkeletonRect className="w-10 h-10 rounded-full" />
                </div>
              </div>

              {/* Thumbnails row */}
              <div className="flex overflow-x-hidden space-x-2">
                {Array(8)
                  .fill()
                  .map((_, index) => (
                    <div
                      key={index}
                      className="relative w-20 h-16 bg-gray-300 flex-shrink-0">
                      <div className="absolute inset-0 skeleton-wave"></div>
                    </div>
                  ))}
              </div>

              {/* Image index indicator */}
              <div className="mt-2 flex justify-center">
                <SkeletonRect className="w-24 h-6 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageSkeleton>
  )
}

export default GalleryPageSkeleton
