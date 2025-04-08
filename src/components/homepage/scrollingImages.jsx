import { useRef, useState, useEffect } from "react"
import { motion as m, useMotionValue, useAnimationFrame } from "framer-motion"

const ScrollingImages = ({ images, velocity = -10, isVisible = true }) => {
  const baseX = useMotionValue(0)
  const imageCount = images.length
  // Only creating the duplicated array once
  const duplicatedImages = useRef([...images, ...images, ...images]).current
  const mover = useRef(null)
  const [imagesReady, setImagesReady] = useState(false)
  const [loadedImages, setLoadedImages] = useState({})
  const loadedImagesCount = useRef(0)
  // Store the threshold in a ref to avoid recreating it on every render
  const threshold = useRef(Math.min(3, Math.ceil(images.length / 2)))

  // Handle image loading
  useEffect(() => {
    if (images.length === 0) {
      setImagesReady(true)
      return
    }

    // Update threshold if images change
    threshold.current = Math.min(3, Math.ceil(images.length / 2))

    // Safety timeout to ensure we eventually show something
    const timeout = setTimeout(() => {
      setImagesReady(true)
    }, 2000)

    return () => clearTimeout(timeout)
  }, [images])

  const handleImageLoad = (src) => {
    if (!loadedImages[src]) {
      loadedImagesCount.current += 1

      setLoadedImages((prev) => ({
        ...prev,
        [src]: true,
      }))

      // Check if we've loaded enough images to show
      if (loadedImagesCount.current >= threshold.current) {
        setImagesReady(true)
      }
    }
  }

  const getContentWidth = () => {
    if (!mover?.current) return 100 * imageCount
    return mover.current.scrollWidth / 3
  }

  // Animation frame for smooth scrolling
  useAnimationFrame((_, delta) => {
    if (isVisible && mover.current) {
      const moveBy = velocity * (delta / 1000)
      const currentX = baseX.get()
      const contentWidth = getContentWidth()

      if (currentX <= -contentWidth) {
        // Reset position when scrolled through full width
        baseX.set(0)
      } else {
        baseX.set(currentX + moveBy)
      }
    }
  })

  if (!imagesReady && images.length > 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-full h-[50px] bg-[#2D5E34] opacity-30 animate-pulse"></div>
      </div>
    )
  }

  return (
    <m.div
      className="relative w-full overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}>
      <m.div
        ref={mover}
        className="whitespace-nowrap will-change-transform"
        style={{ x: baseX }}>
        {duplicatedImages.map((src, index) => (
          <img
            key={`${index}-${src}`}
            src={src}
            alt={`Logo ${index}`}
            className="inline-block h-[50px] px-5"
            style={{
              width: "auto",
              opacity: loadedImages[src] ? 1 : 0,
              transition: "opacity 0.3s ease-in-out",
            }}
            onLoad={() => handleImageLoad(src)}
          />
        ))}
      </m.div>
    </m.div>
  )
}

export default ScrollingImages
