import OOMSection from "../components/homepage/oomSection.jsx"
import CoursesSection from "../components/homepage/coursesSection.jsx"
import FixturesSection from "../components/homepage/fixturesSection.jsx"
import Scroller from "../components/homepage/Scroller.jsx"
import WelcomeSection from "../components/homepage/welcomeSection.jsx"
import StartTimesSection from "../components/homepage/startTimeSection.jsx"

const HomePage = () => {
  return (
    <>
      <div className="flex flex-col w-full">
        <WelcomeSection />
        <Scroller />
        <StartTimesSection />
        <hr className="border-black" />
        <FixturesSection />
        <hr className="border-black" />
        <CoursesSection />
        <hr className="border-black" />
        <OOMSection />
      </div>
    </>
  )
}

export default HomePage
