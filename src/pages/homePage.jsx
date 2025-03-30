import { useState, useEffect } from "react"
import OOMSection from "../components/homepage/oomSection.jsx"
import CoursesSection from "../components/homepage/coursesSection.jsx"
import FixturesSection from "../components/homepage/fixturesSection.jsx"
import Scroller from "../components/homepage/Scroller.jsx"
import WelcomeSection from "../components/homepage/welcomeSection.jsx"
import TeeTimesSection from "../components/homepage/teeTimeSection.jsx"
import ResultsSection from "../components/homepage/resultsSection.jsx"
import { HomePageSkeleton } from "../components/skeletons"
import "./homePage.css"

const HomePage = () => {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading time or wait for critical data
    const timer = setTimeout(() => {
      setLoading(false)
    }, 800) // You can adjust or remove this in production

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <HomePageSkeleton />
  }

  return (
    <>
      <div className="home-page-container">
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
