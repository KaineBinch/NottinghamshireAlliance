// Basic rectangular skeleton with wave animation
export const SkeletonRect = ({ className = "", style = {} }) => {
  return (
    <div
      className={`relative bg-gray-300 overflow-hidden ${className}`}
      style={style}>
      <div className="absolute inset-0 skeleton-wave"></div>
    </div>
  )
}

// Text line skeleton
export const SkeletonText = ({
  width = "100%",
  height = "1rem",
  className = "",
}) => {
  return (
    <SkeletonRect
      className={`rounded ${className}`}
      style={{ width, height }}
    />
  )
}

// Circle skeleton (for logos, avatars, etc.)
export const SkeletonCircle = ({ size = "3rem", className = "" }) => {
  return (
    <SkeletonRect
      className={`rounded-full ${className}`}
      style={{ width: size, height: size }}
    />
  )
}

// Header skeleton with title and subtitle
export const SkeletonHeader = () => {
  return (
    <div className="space-y-2 mb-6">
      <SkeletonText width="60%" height="2rem" />
      <SkeletonText width="40%" height="1rem" />
    </div>
  )
}

// Paragraph skeleton with multiple lines
export const SkeletonParagraph = ({ lines = 3 }) => {
  return (
    <div className="space-y-2">
      {Array(lines)
        .fill()
        .map((_, i) => (
          <SkeletonText
            key={i}
            width={`${Math.floor(Math.random() * 40) + 60}%`}
          />
        ))}
    </div>
  )
}

// Button skeleton
export const SkeletonButton = ({ width = "100px", height = "2.5rem" }) => {
  return <SkeletonRect className="rounded" style={{ width, height }} />
}

// Card skeleton (basic structure for cards)
export const SkeletonCard = ({ height = "250px", className = "" }) => {
  return (
    <div className={`bg-white rounded-md overflow-hidden shadow ${className}`}>
      <SkeletonRect style={{ height: "60%" }} />
      <div className="p-4 space-y-3">
        <SkeletonText height="1.5rem" />
        <SkeletonText width="70%" />
        <SkeletonText width="40%" />
      </div>
    </div>
  )
}

// Table skeleton
export const SkeletonTable = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="bg-white shadow rounded-md overflow-hidden">
      <div className="bg-gray-400 p-3">
        <div className="flex">
          {Array(columns)
            .fill()
            .map((_, i) => (
              <div key={i} className="flex-1 px-2">
                <SkeletonText height="1.25rem" />
              </div>
            ))}
        </div>
      </div>
      <div>
        {Array(rows)
          .fill()
          .map((_, i) => (
            <div
              key={i}
              className={`flex p-3 ${
                i % 2 === 0 ? "bg-gray-200" : "bg-gray-100"
              }`}>
              {Array(columns)
                .fill()
                .map((_, j) => (
                  <div key={j} className="flex-1 px-2">
                    <SkeletonText height="1rem" />
                  </div>
                ))}
            </div>
          ))}
      </div>
    </div>
  )
}

// Results table skeleton specifically for OOM
export const SkeletonOOMTable = ({ rows = 10 }) => {
  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Table buttons */}
      <div className="bg-[#17331B] h-[50px] flex">
        {Array(4)
          .fill()
          .map((_, i) => (
            <div
              key={i}
              className="flex-1 px-2 flex items-center justify-center">
              <SkeletonRect className="h-4 w-20" />
            </div>
          ))}
      </div>

      {/* Table header */}
      <div className="bg-[#D9D9D9] flex p-2 border-b border-gray-400">
        <div className="w-16 px-2">
          <SkeletonText height="1rem" />
        </div>
        <div className="flex-1 px-2">
          <SkeletonText height="1rem" />
        </div>
        <div className="flex-1 px-2">
          <SkeletonText height="1rem" />
        </div>
        <div className="w-32 px-2">
          <SkeletonText height="1rem" />
        </div>
      </div>

      {/* Table rows */}
      {Array(rows)
        .fill()
        .map((_, i) => (
          <div
            key={i}
            className="flex p-2 border-b border-gray-300 hover:bg-gray-200">
            <div className="w-16 px-2">
              <SkeletonText height="1rem" />
            </div>
            <div className="flex-1 px-2">
              <SkeletonText height="1rem" />
            </div>
            <div className="flex-1 px-2">
              <SkeletonText height="1rem" />
            </div>
            <div className="w-32 px-2">
              <SkeletonText height="1rem" />
            </div>
          </div>
        ))}
    </div>
  )
}

// Page skeleton with header and content
export const PageSkeleton = ({ children }) => {
  return (
    <div className="pt-[85px]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-14 mb-6 flex items-end">
          <SkeletonText width="30%" height="2rem" />
        </div>
        <hr className="border-black mb-6" />
        {children}
      </div>
    </div>
  )
}
