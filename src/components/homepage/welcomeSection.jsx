// Enhanced welcomeSection.jsx
import { useState, useEffect } from "react"
import Weather from "./weather.jsx"
import backgroundImage from "../../assets/background.jpg"
import CachedImage from "../../utils/CachedImage.jsx"

const WelcomeSection = () => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [blurredImageLoaded, setBlurredImageLoaded] = useState(false)

  // Add a tiny blurred version for initial render
  const blurredImageSrc = "../../assets/background-tiny.jpg" // Create a 20px wide version of your background

  useEffect(() => {
    // Preload the blurred image
    const blurredImg = new Image()
    blurredImg.src = blurredImageSrc
    blurredImg.onload = () => setBlurredImageLoaded(true)

    // Check if main image is in cache
    const checkMainImageCache = () => {
      const img = new Image()
      img.src = backgroundImage

      // If complete is true, the image was loaded from cache
      if (img.complete) {
        setImageLoaded(true)
      } else {
        img.onload = () => setImageLoaded(true)
      }
    }

    checkMainImageCache()
  }, [])

  useEffect(() => {
    if (imageLoaded) {
      const timer = setTimeout(() => {
        setShowContent(true)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [imageLoaded])

  return (
    <>
      <div
        className="mt-[58px] w-full h-[40svh] place-content-end relative"
        style={{
          backgroundColor: "#214A27",
          transition: "opacity 0.5s ease-in-out",
          opacity: imageLoaded || blurredImageLoaded ? 1 : 0.7,
        }}>
        {/* Blurred background fallback */}
        {blurredImageLoaded && !imageLoaded && (
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              backgroundImage: `url(${blurredImageSrc})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(20px)",
              transform: "scale(1.1)",
            }}
          />
        )}

        {/* Main background image */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: imageLoaded ? 1 : 0,
            transition: "opacity 0.5s ease-in-out",
          }}>
          {/* Hidden image for preloading */}
          <CachedImage
            src={backgroundImage}
            alt="Background"
            className="hidden"
            onLoad={() => setImageLoaded(true)}
          />
        </div>

        {/* Weather component */}
        <div className="relative z-10">
          <Weather city="Nottingham" />
        </div>
      </div>

      <div
        className="bg-[#D9D9D9] flex place-content-center"
        style={{
          opacity: showContent ? 1 : 0,
          transform: showContent ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}>
        <div className="text-center text-black px-5 py-[50px] max-w-5xl">
          <h1>Welcome to the Nottinghamshire Golf Alliance</h1>
          <p className="py-[25px]">
            Experience the best golf courses in Nottinghamshire and compete with
            amateurs and professionals in our exciting competitions. The
            Nottinghamshire Amateur & Professional Golfer{"'"}s Alliance brings
            golfers of all levels together for skill development and friendly
            competition. Enjoy regular tournaments and a welcoming atmosphere
            that fosters connections within the golfing community.
          </p>
          <a
            className="btn rounded-none mr-8 w-[125px] border-black"
            href="/teetimes">
            Tee Times
          </a>
          <a
            className="btn rounded-none ml-8 w-[125px] border-black text-white bg-[#214A27]"
            href="/results">
            Results
          </a>
        </div>
      </div>
    </>
  )
}

export default WelcomeSection
