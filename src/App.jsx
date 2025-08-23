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
import AdminNavbar from "./components/adminNavbar"
import MobFoot from "./components/footer/mobileFooter"
import { PosthogPageViewTracker } from "./components/posthogPageViewTracker"
import { Auth0Provider } from "@auth0/auth0-react"
import { LiveScoreProvider } from "./constants/LiveScoreContext"

const domain = import.meta.env.VITE_AUTH0_DOMAIN
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID

const MainLayout = () => (
  <>
    <PosthogPageViewTracker />
    <ScrollToTop />
    <Navbar />
    <div id="content">
      <Outlet />
    </div>
    <MobFoot />
  </>
)

const AdminLayout = () => (
  <>
    <PosthogPageViewTracker />
    <ScrollToTop />
    <AdminNavbar />
    <div id="content">
      <Outlet />
    </div>
  </>
)

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <MainLayout />,
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
        { path: "/results/:eventId", element: <FurtherResultsPage /> },
        { path: appRoutes.notFound, element: <NotFound /> },
        { path: "*", element: <NotFound /> },
      ],
    },
    {
      path: appRoutes.admin,
      element: <AdminLayout />,
      children: [
        {
          index: true,
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
  return (
    <LiveScoreProvider>
      <RouterProvider router={router} />
    </LiveScoreProvider>
  )
}

export default App
