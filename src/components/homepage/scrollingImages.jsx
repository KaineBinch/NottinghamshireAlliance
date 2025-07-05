import { useRef, useState, useEffect } from "react"
import { motion as m, useMotionValue, useAnimationFrame } from "framer-motion"

const ScrollingImages = ({ images, velocity = -10, isVisible = true }) => {
  const baseX = useMotionValue(0)
  const imageCount = images.length
  const duplicatedImages = [...images, ...images, ...images]
  const mover = useRef(null)
  const [imagesReady, setImagesReady] = useState(false)
  const [loadedImages, setLoadedImages] = useState({})
  const loadedCountRef = useRef(0)

  useEffect(() => {
    if (images.length === 0) return

    const imageStatus = {}
    loadedCountRef.current = 0

    const markImageLoaded = (src) => {
      if (!imageStatus[src]) {
        imageStatus[src] = true
        loadedCountRef.current++

        setLoadedImages((prev) => ({ ...prev, [src]: true }))

        const threshold = Math.min(3, Math.ceil(images.length / 2))
        if (loadedCountRef.current >= threshold && !imagesReady) {
          setImagesReady(true)
        }
      }
    }

    const preloadedCount = images.filter((src) => loadedImages[src]).length
    if (
      preloadedCount >= Math.min(3, Math.ceil(images.length / 2)) &&
      !imagesReady
    ) {
      setImagesReady(true)
    }

    duplicatedImages.forEach((src) => {
      if (src && !loadedImages[src]) {
        const img = new Image()
        img.src = src
        img.onload = () => markImageLoaded(src)
        img.onerror = () => markImageLoaded(src)
      } else if (src && loadedImages[src]) {
        loadedCountRef.current++
      }
    })

    const timeout = setTimeout(() => {
      if (!imagesReady) {
        setImagesReady(true)
      }
    }, 1500)

    return () => clearTimeout(timeout)
  }, [images, imagesReady])

  const getContentWidth = () => {
    if (!mover?.current) return 100 * imageCount
    return mover.current.scrollWidth / 3
  }

  useAnimationFrame((_, delta) => {
    if (isVisible && imagesReady && mover.current) {
      const moveBy = velocity * (delta / 1000)
      baseX.set(baseX.get() + moveBy)
      const contentWidth = getContentWidth()
      if (baseX.get() <= -contentWidth) baseX.set(0)
    }
  })

  if (!imagesReady) {
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
            key={index}
            src={src}
            alt={`Logo ${index}`}
            className="inline-block h-[50px] px-5"
            style={{
              width: "auto",
              opacity: loadedImages[src] ? 1 : 0,
              transition: "opacity 0.3s ease-in-out",
            }}
          />
        ))}
      </m.div>
    </m.div>
  )
}

export default ScrollingImages
