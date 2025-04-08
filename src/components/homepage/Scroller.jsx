import { useState, useEffect, useRef } from "react"
import { BASE_URL } from "../../constants/api"
import ScrollingImages from "./scrollingImages"

const LOGOS_CACHE_KEY = "notts_alliance_logo_cache"
const LOGOS_CACHE_EXPIRY = 24 * 60 * 60 * 1000

const LogoScroller = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [clubLogos, setClubLogos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const fetchAttempted = useRef(false)

  useEffect(() => {
    const fetchLogos = async () => {
      if (fetchAttempted.current) return
      fetchAttempted.current = true

      setIsLoading(true)

      try {
        const cachedLogos = localStorage.getItem(LOGOS_CACHE_KEY)

        if (cachedLogos) {
          const { logos, timestamp } = JSON.parse(cachedLogos)
          const now = Date.now()

          if (now - timestamp < LOGOS_CACHE_EXPIRY && logos.length > 0) {
            setClubLogos(logos)
            setImagesLoaded(true)
            setIsLoading(false)

            const timer = setTimeout(() => {
              setIsVisible(true)
            }, 100)

            return () => clearTimeout(timer)
          }
        }
      } catch (e) {
        console.warn("Error reading logo cache:", e.message)
      }

      try {
        const response = await fetch(`${BASE_URL}/api/upload/files`)

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const data = await response.json()

        const scrollLogos = data.filter(
          (file) => file.name && file.name.includes("ScrollLogo")
        )

        const logoUrls = scrollLogos.map((file) => `${BASE_URL}${file.url}`)

        try {
          localStorage.setItem(
            LOGOS_CACHE_KEY,
            JSON.stringify({
              logos: logoUrls,
              timestamp: Date.now(),
            })
          )
        } catch (e) {
          console.warn("Error caching logos:", e.message)
        }

        setClubLogos(logoUrls)
        setImagesLoaded(true)
        setIsLoading(false)

        const timer = setTimeout(() => {
          setIsVisible(true)
        }, 100)

        return () => clearTimeout(timer)
      } catch (err) {
        console.error("Error fetching logos:", err)
        setError(err)
        setIsLoading(false)
      }
    }

    fetchLogos()
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center bg-[#214A27]">
        <hr className="border-black w-full" />
        <div className="h-[75px] overflow-hidden flex items-center justify-center w-full mx-auto">
          <div className="w-full h-[50px] bg-[#2D5E34] opacity-30 animate-pulse"></div>
        </div>
        <hr className="border-black w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center bg-[#214A27]">
        <hr className="border-black w-full" />
        <div className="h-[75px] overflow-hidden flex items-center justify-center w-full mx-auto">
          <div className="text-white opacity-70">Unable to load club logos</div>
        </div>
        <hr className="border-black w-full" />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center bg-[#214A27]">
      <hr className="border-black w-full" />
      <div
        className="h-[75px] overflow-hidden flex items-center justify-center w-full mx-auto"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.8s ease-in-out",
        }}>
        {imagesLoaded && clubLogos.length > 0 ? (
          <ScrollingImages
            images={clubLogos}
            velocity={-50}
            isVisible={isVisible}
          />
        ) : (
          <div className="text-white">No logo images found</div>
        )}
      </div>
      <hr className="border-black w-full" />
    </div>
  )
}

export default LogoScroller
