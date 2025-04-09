// Enhancement for CachedImage.jsx
import { useState, useEffect, useMemo } from "react"

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

  // Check if WebP is supported
  const [supportsWebP, setSupportsWebP] = useState(false)

  useEffect(() => {
    // Detect WebP support
    const checkWebPSupport = async () => {
      try {
        const webPCheck = new Image()
        webPCheck.onload = function () {
          setSupportsWebP(this.width > 0 && this.height > 0)
        }
        webPCheck.onerror = function () {
          setSupportsWebP(false)
        }
        webPCheck.src =
          "data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA=="
      } catch (e) {
        setSupportsWebP(false)
      }
    }

    checkWebPSupport()
  }, [])

  // Convert src to WebP if supported
  const optimizedSrc = useMemo(() => {
    if (supportsWebP && src && src.match(/\.(jpg|jpeg|png)$/i)) {
      // If you have WebP versions available, use this logic
      return src.replace(/\.(jpg|jpeg|png)$/i, ".webp")
    }
    return src
  }, [src, supportsWebP])

  const handleLoad = () => {
    setIsLoaded(true)
    if (onLoad) onLoad()
  }

  const handleError = () => {
    setHasError(true)
  }

  const placeholderElement =
    !isLoaded && !hasError ? (
      <div className={placeholderClassName || className}>
        <div className="w-full h-full bg-gray-300 animate-pulse"></div>
      </div>
    ) : null

  if (hasError) {
    return <div className={className}>{alt || "Image failed to load"}</div>
  }

  return (
    <>
      {placeholderElement}
      <img
        src={optimizedSrc}
        alt={alt || ""}
        className={`${className} ${!isLoaded ? "hidden" : ""}`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        {...props}
      />
    </>
  )
}

export default CachedImage
