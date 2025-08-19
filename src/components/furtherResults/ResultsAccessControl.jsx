import { Trophy } from "lucide-react"

const ResultsAccessControl = ({ eventStatus, event }) => {
  console.log("=== RESULTS ACCESS CONTROL DEBUG ===")
  console.log("eventStatus:", eventStatus)
  console.log("event:", event)
  console.log("hasScores:", event?.scores?.length > 0)
  console.log("=== END ACCESS CONTROL DEBUG ===")

  // Check if results should be blocked
  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Event Not Found
          </h2>
          <p className="text-gray-600">
            The requested event could not be found.
          </p>
        </div>
      </div>
    )
  }

  const hasScores = event.scores && event.scores.length > 0

  // Block if event has no scores at all
  if (!hasScores) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            No Results Available
          </h2>
          <p className="text-gray-600 mb-2">
            This event doesn&apos;t have any scores yet.
          </p>
        </div>
      </div>
    )
  }

  // SIMPLIFIED LOGIC: Allow access if:
  // 1. Results are explicitly released, OR
  // 2. Event is marked as legacy, OR
  // 3. Event has no live score management (lastUpdated is null)
  const shouldAllowAccess =
    eventStatus.resultsReleased ||
    eventStatus.isLegacyEvent ||
    !eventStatus.lastUpdated

  // Only block if event has live score management but results aren't released and not currently live
  if (!shouldAllowAccess && !eventStatus.isLive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Results Not Yet Available
          </h2>
          <p className="text-gray-600 mb-2">
            Results for this event will be available once scoring is complete.
          </p>
          {eventStatus.isLive && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-blue-700 font-medium">
                🔴 Live scoring is currently in progress
              </p>
              <p className="text-blue-600 text-sm">
                Check back to the main results page to view live scores
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Allow access - return null to continue with normal rendering
  console.log("🟢 ALLOWING ACCESS - returning null")
  return null
}

export default ResultsAccessControl
