import { useEffect, useState } from "react"

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
      className="hero min-h-screen"
      style={{
        backgroundImage:
          "url(https://images.unsplash.com/photo-1602212096437-d0af1ce0553e?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)",
      }}>
      <div className="hero-overlay bg-opacity-30"></div>
      <div className="hero-content text-center text-neutral-content">
        <div className="max-w-md">
          <h1 className="text-8xl font-bold">404</h1>
          <p className="mb-10">Looks like that page isn{"'"}t available</p>
          <div
            style={styles.progressBar}
            className="h-16 -mb-16 bg-secondary"
          />
          <div className="h-16 w-[245px] relative bg-black p-1 border-double border-4 border-secondary bg-opacity-60">
            <p>
              Automatically sending you home in:{" "}
              <span className="countdown mt-1">
                <span style={{ "--value": redirectTime }}></span>
              </span>
              s
            </p>
            <a href="/" className="btn mt-8">
              Take me home now!
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
export default NotFound
