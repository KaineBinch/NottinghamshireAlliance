import { useEffect, useState } from "react"
import "./notFound.css" // Import the new CSS file

const INITIAL_REDIRECT_TIME = 10

const NotFound = () => {
  const [redirectTime, setRedirectTime] = useState(INITIAL_REDIRECT_TIME)
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (redirectTime > 0) setRedirectTime(redirectTime - 1)
      else window.location.href = "/"
    }, 1000)
    return () => {
      clearTimeout(timeout)
    }
  }, [redirectTime])
  const getStyles = () => ({
    progressBar: {
      width: 245 * (redirectTime / INITIAL_REDIRECT_TIME),
      transition: "all 1s ease-in-out",
    },
  })
  const styles = getStyles()
  return (
    <div
      className="not-found-hero"
      style={{
        backgroundImage:
          "url(https://images.unsplash.com/photo-1602212096437-d0af1ce0553e?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)",
      }}>
      <div className="hero-background-overlay"></div>
      <div className="hero-content-wrapper">
        <div className="not-found-content">
          <h1 className="page-title">404</h1>
          <p className="page-subtitle">
            Looks like that page isn{"'"}t available
          </p>
          <div
            style={styles.progressBar}
            className="h-16 -mb-16 bg-secondary"
          />
          <div className="countdown-container">
            <p>
              Automatically sending you home in:{" "}
              <span className="countdown-text">
                <span style={{ "--value": redirectTime }}></span>
              </span>
              s
            </p>
            <a href="/" className="home-button">
              Take me home now!
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
export default NotFound
