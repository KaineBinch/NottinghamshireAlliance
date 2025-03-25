const Spinner = ({ size = "md", color = "#214A27" }) => {
  const sizeMap = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  }

  const sizeClass = sizeMap[size] || sizeMap.md

  return (
    <div className="inline-block ml-3">
      <div
        className={`${sizeClass} animate-spin rounded-full border-4 border-solid `}
        style={{ borderColor: "rgba(33, 74, 39, 0.25)", borderTopColor: color }}
        role="status">
        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
          Please Wait
        </span>
      </div>
    </div>
  )
}

export default Spinner
