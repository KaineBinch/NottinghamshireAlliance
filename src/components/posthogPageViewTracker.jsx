import { useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"

export const PosthogPageViewTracker = () => {
  const location = useLocation()
  const lastTrackedPath = useRef("")

  useEffect(() => {
    if (lastTrackedPath.current === location.pathname) {
      return
    }

    lastTrackedPath.current = location.pathname

    const posthog = window.posthog

    if (posthog) {
      try {
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
      if (import.meta.env.DEV) {
        console.warn("[PostHog] PostHog is not available for tracking")
      }
    }
  }, [location])

  return null
}

export default PosthogPageViewTracker
