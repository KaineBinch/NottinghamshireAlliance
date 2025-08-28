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

  const getContentHeight = () => {
    if (!contentRef?.current) return 1000
    const scrollHeight = contentRef.current.scrollHeight
    // When scrolling, we always duplicate, so divide by 2
    // When paused, we don't duplicate
    return isScrolling ? scrollHeight / 2 : scrollHeight
  }

  useAnimationFrame((_, delta) => {
    if (isScrolling && contentRef.current) {
      const moveBy = velocity * (delta / 1000)
      const newY = baseY.get() + moveBy
      baseY.set(newY)

      // Reset when we've scrolled past the first copy with a small buffer
      const contentHeight = getContentHeight()
      const resetBuffer = Math.abs(velocity) * 0.3 // Small buffer based on velocity

      if (newY <= -(contentHeight + resetBuffer)) {
        baseY.set(0)
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
        ? contentRef.current.scrollHeight / 2
        : 0

      if (currentY < -singleContentHeight) {
        // We're in the duplicate section, move back to equivalent position in original
        const equivalentPosition = currentY + singleContentHeight
        baseY.set(equivalentPosition)
      }
    }
  }, [isScrolling])

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

        {/* Always duplicate when scrolling for seamless infinite loop */}
        {isScrolling && <div className="w-full">{children}</div>}
      </m.div>
    </div>
  )
}

export default VerticalInfiniteScroll
