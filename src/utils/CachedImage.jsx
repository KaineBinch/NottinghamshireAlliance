import { useState } from "react"

// A much simpler CachedImage component that will work reliably
const CachedImage = ({
  src,
  alt,
  className = "",
  placeholderClassName = "",
  onLoad,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoaded(true)
    if (onLoad) onLoad()
  }

  const handleError = () => {
    setHasError(true)
  }

  // Show a placeholder until the image loads
  const placeholderElement =
    !isLoaded && !hasError ? (
      <div className={placeholderClassName || className}>
        <div className="w-full h-full bg-gray-300 animate-pulse"></div>
      </div>
    ) : null

  // If there was an error loading, show a fallback
  if (hasError) {
    return <div className={className}>{alt || "Image failed to load"}</div>
  }

  return (
    <>
      {placeholderElement}
      <img
        src={src}
        alt={alt || ""}
        className={`${className} ${!isLoaded ? "hidden" : ""}`}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </>
  )
}

export default CachedImage
