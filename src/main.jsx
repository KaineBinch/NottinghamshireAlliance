import React from "react"
import { QueryClient, QueryClientProvider } from "react-query"
import ReactDOM from "react-dom/client"
import App from "./App.jsx"
import { HashRouter } from "react-router-dom"
import { library } from "@fortawesome/fontawesome-svg-core"
import {
  fab,
  faSquareFacebook,
  faSquareInstagram,
} from "@fortawesome/free-brands-svg-icons"
import { faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons"
import { PostHogProvider } from "posthog-js/react"

library.add(fab, faPhone, faEnvelope, faSquareFacebook, faSquareInstagram)

const options = {
  api_host: import.meta.env.VITE_REACT_APP_PUBLIC_POSTHOG_HOST,
}
const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <PostHogProvider
      apiKey={import.meta.env.VITE_REACT_APP_PUBLIC_POSTHOG_KEY}
      options={options}>
      <HashRouter>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </HashRouter>
    </PostHogProvider>
  </React.StrictMode>
)
