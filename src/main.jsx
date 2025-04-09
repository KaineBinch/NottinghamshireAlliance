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
  posthog.debug(false) // Reduced debug noise
}

// Configure React Query with 24-hour caching
const TWENTY_FOUR_HOURS = 1000 * 60 * 60 * 24

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      refetchOnMount: false, // Don't refetch when component mounts if data is fresh
      staleTime: TWENTY_FOUR_HOURS, // Consider data fresh for 24 hours
      cacheTime: TWENTY_FOUR_HOURS, // Keep unused data in cache for 24 hours
      retry: 1, // Only retry failed requests once
    },
  },
})

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log(
          "ServiceWorker registration successful:",
          registration.scope
        )
      })
      .catch((error) => {
        console.log("ServiceWorker registration failed:", error)
      })
  })
}

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
