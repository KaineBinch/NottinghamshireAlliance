import { Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import { HomePage, NotFound } from "./pages";
import { appRoutes } from "./constants/appRoutes";
import ScrollToTop from "./components/scrollToTop";

function App() {
  const location = useLocation();

  return (
    <>
      <ScrollToTop />
      <Routes location={location} key={location.pathname}>
        <Route exact path={appRoutes.home} element={<HomePage />} />
        <Route path={appRoutes.notFound} element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
