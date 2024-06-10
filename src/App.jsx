import { Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import {
  HomePage,
  NotFound,
  ContactPage,
  CoursesPage,
  FixturesPage,
  GalleryPage,
  ResultsPage,
  RulesPage,
  StartTimesPage,
} from "./pages";
import { appRoutes } from "./constants/appRoutes";
import ScrollToTop from "./components/scrollToTop";

function App() {
  const location = useLocation();

  return (
    <>
      <ScrollToTop />
      <Routes location={location} key={location.pathname}>
        <Route exact path={appRoutes.home} element={<HomePage />} />
        <Route exact path={appRoutes.contact} element={<ContactPage />} />
        <Route exact path={appRoutes.courses} element={<CoursesPage />} />
        <Route exact path={appRoutes.fixtures} element={<FixturesPage />} />
        <Route exact path={appRoutes.gallery} element={<GalleryPage />} />
        <Route exact path={appRoutes.results} element={<ResultsPage />} />
        <Route exact path={appRoutes.rules} element={<RulesPage />} />
        <Route exact path={appRoutes.startTimes} element={<StartTimesPage />} />
        <Route path={appRoutes.notFound} element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
