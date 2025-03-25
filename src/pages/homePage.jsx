import OOMSection from "../components/homepage/oomSection.jsx"
import CoursesSection from "../components/homepage/coursesSection.jsx"
import FixturesSection from "../components/homepage/fixturesSection.jsx"
import Scroller from "../components/homepage/Scroller.jsx"
import WelcomeSection from "../components/homepage/welcomeSection.jsx"
import TeeTimesSection from "../components/homepage/teeTimeSection.jsx"
import ResultsSection from "../components/homepage/resultsSection.jsx"
import "./homePage.css" // Import the new CSS file

const HomePage = () => {
  return (
    <>
      <div className="home-page-container">
        <WelcomeSection />
        <Scroller />
        <TeeTimesSection />
        <hr className="section-divider" />
        <ResultsSection />
        <hr className="section-divider" />
        <OOMSection />
        <hr className="section-divider" />
        <CoursesSection />
        <hr className="section-divider" />
        <FixturesSection />
      </div>
    </>
  )
}

export default HomePage
