import { useState, useEffect, useRef } from "react"
import OOMSection from "../components/homepage/oomSection.jsx"
import CoursesSection from "../components/homepage/coursesSection.jsx"
import FixturesSection from "../components/homepage/fixturesSection.jsx"
import Scroller from "../components/homepage/Scroller.jsx"
import WelcomeSection from "../components/homepage/welcomeSection.jsx"
import TeeTimesSection from "../components/homepage/teeTimeSection.jsx"
import ResultsSection from "../components/homepage/resultsSection.jsx"
import "./homePage.css"

// Component that only appears when scrolled into view
const ScrollRevealSection = ({ children, id }) => {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // When section comes into view
        if (entry.isIntersecting) {
          setIsVisible(true)
          // Once visible, no need to keep observing
          observer.unobserve(entry.target)
        }
      },
      {
        // Section becomes visible when 20% of it enters the viewport
        threshold: 0.2,
        // Start loading when element is 100px away from viewport
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

// Component that loads in a cascading fashion at startup, then uses scroll reveal
const HomePage = () => {
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const [visibleSections, setVisibleSections] = useState({
    welcome: false,
    scroller: false,
    teeTimes: false,
  })

  // First load the above-the-fold content in cascade
  useEffect(() => {
    // Start with a short delay
    setTimeout(() => {
      // First show welcome
      setVisibleSections((prev) => ({ ...prev, welcome: true }))

      // Then show scroller
      setTimeout(() => {
        setVisibleSections((prev) => ({ ...prev, scroller: true }))

        // Then show tee times
        setTimeout(() => {
          setVisibleSections((prev) => ({ ...prev, teeTimes: true }))

          // Mark initial load as complete
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
        </>
      )}
    </div>
  )
}

export default HomePage
