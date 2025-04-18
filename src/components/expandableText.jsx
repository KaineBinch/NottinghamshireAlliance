import { useState, useEffect, useRef } from "react"

const ExpandableText = ({ text }) => {
  const [expanded, setExpanded] = useState(false)
  const [shouldTruncate, setShouldTruncate] = useState(false)
  const textRef = useRef(null)
  const fullTextRef = useRef(null)

  const formatText = (inputText) => {
    if (!inputText) return "No event review available."

    return inputText
      .toLowerCase()
      .split(/(?<=[.!?])\s+/)
      .map((sentence) => {
        return sentence.charAt(0).toUpperCase() + sentence.slice(1)
      })
      .join(" ")
  }

  const content = formatText(text)

  useEffect(() => {
    const checkTruncation = () => {
      if (textRef.current && fullTextRef.current) {
        const truncatedHeight = textRef.current.clientHeight
        const fullHeight = fullTextRef.current.clientHeight

        setShouldTruncate(fullHeight > truncatedHeight)
      }
    }

    const timer = setTimeout(checkTruncation, 10)

    window.addEventListener("resize", checkTruncation)

    return () => {
      clearTimeout(timer)
      window.removeEventListener("resize", checkTruncation)
    }
  }, [content])

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
