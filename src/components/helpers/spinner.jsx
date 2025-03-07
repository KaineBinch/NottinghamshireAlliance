const Spinner = ({ size = "md", color = "#3498db" }) => {
  // Size mapping
  const sizeMap = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  }

  // Get the correct size class
  const sizeClass = sizeMap[size] || sizeMap.md

  return (
    <div className="flex items-center justify-center w-full py-8">
      <div
        className={`inline-block ${sizeClass} animate-spin rounded-full border-4 border-solid border-gray-200`}
        style={{ borderTopColor: color }}
        role="status">
        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
          Please Wait
        </span>
      </div>
    </div>
  )
}

export default Spinner
