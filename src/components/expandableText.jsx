import { useState, useEffect, useRef } from "react"

const ExpandableText = ({ text }) => {
  const [expanded, setExpanded] = useState(false)
  const [shouldTruncate, setShouldTruncate] = useState(false)
  const textRef = useRef(null)

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
    // Check if content is long enough to need truncation
    if (textRef.current) {
      const fullHeight = textRef.current.scrollHeight
      const lineHeight = parseInt(getComputedStyle(textRef.current).lineHeight)
      const approxLines = fullHeight / (lineHeight || 20) // Fallback to 20px if lineHeight is not available

      // If more than 4 lines (or 3 on mobile), we should truncate
      setShouldTruncate(approxLines > (window.innerWidth <= 768 ? 3 : 4))
    }
  }, [content])

  // Simply show the entire text or a truncated version with Read more/less buttons
  return (
    <div className="event-review-container">
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
          <button
            className="read-less-button"
            onClick={() => setExpanded(false)}>
            Read less
          </button>
        </>
      )}
    </div>
  )
}

export default ExpandableText
