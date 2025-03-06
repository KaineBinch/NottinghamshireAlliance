import { usePostHog } from "posthog-js/react"
import { useEffect } from "react"
import { useLocation } from "react-router-dom"

export const PosthogPageViewTracker = () => {
  const posthog = usePostHog()
  const location = useLocation()

  useEffect(() => {
    posthog.capture("pageview", { path: location.pathname })
  }, [location, posthog])
  return null
}
