import OOMSection from "../components/homepage/oomSection.jsx"
import CoursesSection from "../components/homepage/coursesSection.jsx"
import FixturesSection from "../components/homepage/fixturesSection.jsx"
import Scroller from "../components/homepage/Scroller.jsx"
import WelcomeSection from "../components/homepage/welcomeSection.jsx"
import TeeTimesSection from "../components/homepage/teeTimeSection.jsx"
import ResultsSection from "../components/homepage/resultsSection.jsx"

const HomePage = () => {
  return (
    <>
      <div className="flex flex-col w-full">
        <WelcomeSection />
        <Scroller />
        <TeeTimesSection />
        <hr className="border-black" />
        <ResultsSection />
        <hr className="border-black" />
        <OOMSection />
        <hr className="border-black" />
        <CoursesSection />
        <hr className="border-black" />
        <FixturesSection />
      </div>
    </>
  )
}

export default HomePage
