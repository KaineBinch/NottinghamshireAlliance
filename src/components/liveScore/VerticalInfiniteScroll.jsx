// VerticalInfiniteScroll.jsx
import { useRef, useState, useEffect } from "react"
import { motion as m, useMotionValue, useAnimationFrame } from "framer-motion"

const VerticalInfiniteScroll = ({
  children,
  velocity = -50,
  isScrolling = true,
  onScrollToggle,
  containerHeight = "calc(100vh - 160px)",
}) => {
  const baseY = useMotionValue(0)
  const containerRef = useRef(null)
  const contentRef = useRef(null)
  const [isReady, setIsReady] = useState(false)
  const [needsDuplication, setNeedsDuplication] = useState(true)

  // Initialize component and check if duplication is needed
  useEffect(() => {
    const timer = setTimeout(() => {
      if (contentRef.current && containerRef.current) {
        const contentHeight = contentRef.current.scrollHeight / 2 // Assuming duplication initially
        const containerHeight = containerRef.current.clientHeight

        // Only duplicate if content is shorter than 2x container height
        const shouldDuplicate = contentHeight < containerHeight * 2
        setNeedsDuplication(shouldDuplicate)
      }
      setIsReady(true)
    }, 200)
    return () => clearTimeout(timer)
  }, [])

  const getContentHeight = () => {
    if (!contentRef?.current) return 1000
    const scrollHeight = contentRef.current.scrollHeight
    // When paused, don't divide by 2 since we're not showing duplicates
    return needsDuplication && isScrolling ? scrollHeight / 2 : scrollHeight
  }

  useAnimationFrame((_, delta) => {
    if (isScrolling && isReady && contentRef.current) {
      const moveBy = velocity * (delta / 1000)
      const newY = baseY.get() + moveBy
      baseY.set(newY)

      // Only reset if we're using duplication AND scrolling and scrolled past first copy
      if (needsDuplication && isScrolling) {
        const contentHeight = getContentHeight()
        if (newY <= -contentHeight) {
          baseY.set(0)
        }
      }
    }
  })

  // Handle manual scrolling when paused
  const handleWheel = (e) => {
    if (!isScrolling && containerRef.current) {
      e.preventDefault()
      const scrollAmount = e.deltaY * 0.5
      const currentY = baseY.get()
      const newY = currentY - scrollAmount
      const contentHeight = getContentHeight()

      // When paused, constrain to single content height (no duplication)
      const maxScroll = -(contentHeight - containerRef.current.clientHeight)
      if (newY >= maxScroll && newY <= 0) {
        baseY.set(newY)
      }
    }
  }

  // Handle state changes between scrolling and paused
  useEffect(() => {
    if (!isScrolling) {
      // When pausing, reset position if we're in the duplicate section
      const currentY = baseY.get()
      const singleContentHeight = contentRef.current
        ? contentRef.current.scrollHeight / (needsDuplication ? 2 : 1)
        : 0

      if (needsDuplication && currentY < -singleContentHeight) {
        // We're in the duplicate section, move back to equivalent position in original
        const equivalentPosition = currentY + singleContentHeight
        baseY.set(equivalentPosition)
      }
    }
  }, [isScrolling, needsDuplication])

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === "Space") {
        e.preventDefault()
        onScrollToggle?.()
      }
    }

    document.addEventListener("keydown", handleKeyPress)
    return () => document.removeEventListener("keydown", handleKeyPress)
  }, [onScrollToggle])

  if (!isReady) {
    return (
      <div
        className="w-full flex items-center justify-center bg-gray-100"
        style={{ height: containerHeight }}>
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden"
      style={{ height: containerHeight }}
      onWheel={handleWheel}>
      <m.div
        ref={contentRef}
        className="will-change-transform"
        style={{ y: baseY }}>
        {/* Original content */}
        <div className="w-full pb-12">{children}</div>

        {/* Only duplicate if needed for seamless loop AND currently scrolling */}
        {needsDuplication && isScrolling && (
          <div className="w-full">{children}</div>
        )}
      </m.div>
    </div>
  )
}

export default VerticalInfiniteScroll
