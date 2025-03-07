import { Route, Routes, useLocation } from "react-router-dom"
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

const domain = import.meta.env.VITE_AUTH0_DOMAIN
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID

function App() {
  const location = useLocation()

  return (
    <>
      <PosthogPageViewTracker />
      <ScrollToTop />
      <Navbar />
      <Routes location={location} key={location.pathname}>
        <Route exact path={appRoutes.home} element={<HomePage />} />
        <Route exact path={appRoutes.courses} element={<CoursesPage />} />
        <Route exact path={appRoutes.fixtures} element={<FixturesPage />} />
        <Route exact path={appRoutes.gallery} element={<GalleryPage />} />
        <Route exact path={appRoutes.oom} element={<OrderOfMeritPage />} />
        <Route exact path={appRoutes.results} element={<ResultsPage />} />
        <Route exact path={appRoutes.rules} element={<RulesPage />} />
        <Route
          exact
          path={appRoutes.clubofficers}
          element={<ClubOfficersPage />}
        />
        <Route exact path={appRoutes.teeTimes} element={<TeeTimesPage />} />

        {/* Wrapping AdminPage in Auth0Provider */}
        <Route
          exact
          path={appRoutes.admin}
          element={
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
          }
        />
        <Route path="/results/:clubName" element={<FurtherResultsPage />} />
        <Route path={appRoutes.notFound} element={<NotFound />} />
      </Routes>
      <MobFoot />
    </>
  )
}

export default App
