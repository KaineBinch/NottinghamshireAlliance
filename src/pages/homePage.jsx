import { useState, useEffect, useRef } from "react"
import OOMSection from "../components/homepage/oomSection.jsx"
import CoursesSection from "../components/homepage/coursesSection.jsx"
import FixturesSection from "../components/homepage/fixturesSection.jsx"
import Scroller from "../components/homepage/Scroller.jsx"
import WelcomeSection from "../components/homepage/welcomeSection.jsx"
import TeeTimesSection from "../components/homepage/teeTimeSection.jsx"
import ResultsSection from "../components/homepage/resultsSection.jsx"
import "./homePage.css"

const ScrollRevealSection = ({ children, id }) => {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      {
        threshold: 0.2,
        rootMargin: "100px",
      }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  return (
    <div
      ref={sectionRef}
      id={id}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
        willChange: "opacity, transform",
      }}>
      {children}
    </div>
  )
}

const HomePage = () => {
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const [visibleSections, setVisibleSections] = useState({
    welcome: false,
    scroller: false,
    teeTimes: false,
  })

  useEffect(() => {
    setTimeout(() => {
      setVisibleSections((prev) => ({ ...prev, welcome: true }))

      setTimeout(() => {
        setVisibleSections((prev) => ({ ...prev, scroller: true }))

        setTimeout(() => {
          setVisibleSections((prev) => ({ ...prev, teeTimes: true }))

          setTimeout(() => {
            setInitialLoadComplete(true)
          }, 500)
        }, 200)
      }, 200)
    }, 300)
  }, [])

  return (
    <div className="home-page-container">
      {/* Initial cascading sections */}
      <div
        style={{
          opacity: visibleSections.welcome ? 1 : 0,
          transform: visibleSections.welcome
            ? "translateY(0)"
            : "translateY(20px)",
          transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
        }}>
        <WelcomeSection />
      </div>

      <div
        style={{
          opacity: visibleSections.scroller ? 1 : 0,
          transform: visibleSections.scroller
            ? "translateY(0)"
            : "translateY(20px)",
          transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
        }}>
        <Scroller />
      </div>

      <div
        style={{
          opacity: visibleSections.teeTimes ? 1 : 0,
          transform: visibleSections.teeTimes
            ? "translateY(0)"
            : "translateY(20px)",
          transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
        }}>
        <TeeTimesSection />
      </div>

      {visibleSections.teeTimes && <hr className="border-black" />}

      {/* Scroll-based loading for below-the-fold content */}
      {initialLoadComplete && (
        <>
          <ScrollRevealSection id="results-section">
            <ResultsSection />
          </ScrollRevealSection>

          <hr className="border-black" />
          <ScrollRevealSection id="oom-section">
            <OOMSection />
          </ScrollRevealSection>

          <hr className="border-black" />
          <ScrollRevealSection id="courses-section">
            <CoursesSection />
          </ScrollRevealSection>

          <hr className="border-black" />
          <ScrollRevealSection id="fixtures-section">
            <FixturesSection />
          </ScrollRevealSection>

          <hr className="border-black" />
        </>
      )}
    </div>
  )
}

export default HomePage
