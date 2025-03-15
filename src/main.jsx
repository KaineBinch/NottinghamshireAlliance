import React from "react"
import { QueryClient, QueryClientProvider } from "react-query"
import ReactDOM from "react-dom/client"
import App from "./App.jsx"
import { library } from "@fortawesome/fontawesome-svg-core"
import {
  fab,
  faSquareFacebook,
  faSquareInstagram,
} from "@fortawesome/free-brands-svg-icons"
import { faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons"
import { PostHogProvider } from "posthog-js/react"

library.add(fab, faPhone, faEnvelope, faSquareFacebook, faSquareInstagram)

const posthog = window.posthog || null

if (posthog && import.meta.env.DEV) {
  posthog.debug(true)
  console.log("PostHog debug mode enabled")
}
console.log("PostHog available:", !!posthog)

if (posthog && import.meta.env.DEV) {
  try {
    posthog.capture("test_event", { property: "value", source: "main.jsx" })
  } catch (error) {
    console.warn("Error sending test event:", error)
  }
}

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* Only use PostHogProvider if posthog is available */}
    {posthog ? (
      <PostHogProvider client={posthog}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </PostHogProvider>
    ) : (
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    )}
  </React.StrictMode>
)
