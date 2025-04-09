import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom"
import "./App.css"
import {
  HomePage,
  NotFound,
  CoursesPage,
  FixturesPage,
  GalleryPage,
  ResultsPage,
  RulesPage,
  TeeTimesPage,
  OrderOfMeritPage,
  FurtherResultsPage,
  AdminPage,
  ClubOfficersPage,
} from "./pages"
import { appRoutes } from "./constants/appRoutes"
import ScrollToTop from "./utils/scrollToTop"
import Navbar from "./components/navbar"
import MobFoot from "./components/footer/mobileFooter"
import { PosthogPageViewTracker } from "./components/posthogPageViewTracker"
import { Auth0Provider } from "@auth0/auth0-react"
import { useEffect } from "react"

const domain = import.meta.env.VITE_AUTH0_DOMAIN
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: (
        <>
          <PosthogPageViewTracker />
          <ScrollToTop />
          <Navbar />
          <div id="content">
            <Outlet />
          </div>
          <MobFoot />
        </>
      ),
      children: [
        { path: appRoutes.home, element: <HomePage /> },
        { path: appRoutes.courses, element: <CoursesPage /> },
        { path: appRoutes.fixtures, element: <FixturesPage /> },
        { path: appRoutes.gallery, element: <GalleryPage /> },
        { path: appRoutes.oom, element: <OrderOfMeritPage /> },
        { path: appRoutes.results, element: <ResultsPage /> },
        { path: appRoutes.rules, element: <RulesPage /> },
        { path: appRoutes.clubofficers, element: <ClubOfficersPage /> },
        { path: appRoutes.teeTimes, element: <TeeTimesPage /> },
        {
          path: appRoutes.admin,
          element: (
            <Auth0Provider
              domain={domain}
              clientId={clientId}
              authorizationParams={{
                redirect_uri: window.location.origin,
                audience: import.meta.env.VITE_AUTH0_AUDIENCE,
                scope: "openid profile email",
              }}>
              <AdminPage />
            </Auth0Provider>
          ),
        },
        { path: "/results/:clubName", element: <FurtherResultsPage /> },
        { path: appRoutes.notFound, element: <NotFound /> },
        { path: "*", element: <NotFound /> },
      ],
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
)

function App() {
  useEffect(() => {
    // Listen for storage events (for cross-tab communication)
    const handleStorageChange = (e) => {
      if (e.key === "refresh_trigger") {
        const refreshTimestamp = parseInt(e.newValue || "0")
        const currentTime = Date.now()
        const isRecent = currentTime - refreshTimestamp < 30000 // Within 30 seconds

        if (isRecent) {
          // Check if we're on a page that needs refreshing
          const currentPath = window.location.pathname
          const shouldRefresh =
            currentPath.includes("/teetimes") ||
            currentPath.includes("/results") ||
            currentPath.includes("/oom") ||
            currentPath === "/"

          if (shouldRefresh) {
            console.log(
              `Refresh triggered from another tab at ${new Date(
                refreshTimestamp
              ).toLocaleTimeString()}. Reloading...`
            )

            // Force a full reload to clear all caches
            window.location.reload()
          }
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])
  return <RouterProvider router={router} />
}

export default App
