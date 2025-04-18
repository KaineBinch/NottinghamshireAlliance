import { useState, useEffect } from "react"

const EventReviewInput = ({ onReviewChange, disabled = false }) => {
  const [eventReview, setEventReview] = useState("")
  const [charCount, setCharCount] = useState(0)
  const MAX_CHARS = 1500

  useEffect(() => {
    onReviewChange(eventReview)
  }, [eventReview, onReviewChange])

  const handleReviewChange = (e) => {
    const text = e.target.value
    setEventReview(text)
    setCharCount(text.length)
  }

  return (
    <div className="flex flex-col space-y-2 mb-4">
      <label className="text-sm font-medium mb-1">
        Event Review (Optional)
      </label>
      <div className="relative">
        <textarea
          value={eventReview}
          onChange={handleReviewChange}
          disabled={disabled}
          placeholder="Enter a review or description of the event that will be displayed on the results page..."
          className="w-full p-3 border border-gray-300 rounded h-32 resize-none focus:ring-2 focus:ring-[#214A27] focus:border-transparent"
          maxLength={MAX_CHARS}
        />
        <div className="absolute bottom-2 right-2 text-xs text-gray-500">
          {charCount}/{MAX_CHARS}
        </div>
      </div>
      <p className="text-xs text-gray-500">
        This text will appear on the results page for this event.
      </p>
    </div>
  )
}

export default EventReviewInput
