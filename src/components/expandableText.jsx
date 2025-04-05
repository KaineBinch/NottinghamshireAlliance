import { useState, useEffect, useRef } from "react"

const ExpandableText = ({ text }) => {
  const [expanded, setExpanded] = useState(false)
  const [shouldTruncate, setShouldTruncate] = useState(false)
  const textRef = useRef(null)
  const fullTextRef = useRef(null)

  // Format the text from ALL CAPS to Sentence case
  const formatText = (inputText) => {
    if (!inputText) return "No event review available."

    // Split by sentences (periods, exclamation marks, question marks)
    return inputText
      .toLowerCase()
      .split(/(?<=[.!?])\s+/)
      .map((sentence) => {
        // Capitalize first letter of each sentence
        return sentence.charAt(0).toUpperCase() + sentence.slice(1)
      })
      .join(" ")
  }

  const content = formatText(text)

  useEffect(() => {
    // More reliable check for truncation needs
    const checkTruncation = () => {
      if (textRef.current && fullTextRef.current) {
        const truncatedHeight = textRef.current.clientHeight
        const fullHeight = fullTextRef.current.clientHeight

        // If the full text is taller than the truncated container,
        // we need to show the read more button
        setShouldTruncate(fullHeight > truncatedHeight)
      }
    }

    // Add a small delay to ensure rendering is complete
    const timer = setTimeout(checkTruncation, 10)

    // Also check on window resize
    window.addEventListener("resize", checkTruncation)

    // Cleanup
    return () => {
      clearTimeout(timer)
      window.removeEventListener("resize", checkTruncation)
    }
  }, [content])

  // If the content is just "No event review available" we don't need any buttons
  if (content === "No event review available.") {
    return (
      <div className="event-review-container">
        <p className="event-review-full">{content}</p>
      </div>
    )
  }

  return (
    <div className="event-review-container">
      {/* Hidden full text element for height comparison */}
      <div className="hidden-text-measure">
        <p
          ref={fullTextRef}
          className="event-review-full"
          style={{
            position: "absolute",
            visibility: "hidden",
            height: "auto",
          }}>
          {content}
        </p>
      </div>

      {!expanded ? (
        <>
          <p ref={textRef} className="event-review-truncated">
            {content}
          </p>
          {shouldTruncate && (
            <button
              className="read-more-button"
              onClick={() => setExpanded(true)}>
              Read more
            </button>
          )}
        </>
      ) : (
        <>
          <p className="event-review-full">{content}</p>
          {shouldTruncate && (
            <button
              className="read-less-button"
              onClick={() => setExpanded(false)}>
              Read less
            </button>
          )}
        </>
      )}
    </div>
  )
}

export default ExpandableText
