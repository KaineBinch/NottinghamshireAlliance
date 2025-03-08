// components/posthogPageViewTracker.jsx
import { useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"

export const PosthogPageViewTracker = () => {
  const location = useLocation()
  const lastTrackedPath = useRef("")

  useEffect(() => {
    // Don't track the same path twice in a row
    if (lastTrackedPath.current === location.pathname) {
      return
    }

    // Store this path as the last tracked path
    lastTrackedPath.current = location.pathname

    // Access PostHog from the window object (set by the snippet)
    const posthog = window.posthog

    // Only track if PostHog is available
    if (posthog) {
      try {
        // Capture the page view with additional properties
        posthog.capture("$pageview", {
          $current_url: window.location.href,
          $pathname: location.pathname,
          $search: location.search,
          path: location.pathname,
          hash: location.hash,
          referrer: document.referrer,
          referring_domain: document.referrer
            ? new URL(document.referrer).hostname
            : "",
        })
      } catch (error) {
        console.warn(`[PostHog] Error tracking page view: ${error.message}`)
      }
    } else {
      // If PostHog isn't available, log a message in development
      if (import.meta.env.DEV) {
        console.warn("[PostHog] PostHog is not available for tracking")
      }
    }
  }, [location])

  return null
}

export default PosthogPageViewTracker
