import { useState, useEffect } from "react"
import { BASE_URL } from "../../constants/api"
import ScrollingImages from "./scrollingImages"

const LogoScroller = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [clubLogos, setClubLogos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchLogos = async () => {
      setIsLoading(true)
      try {
        console.log("Fetching files from Strapi...")
        const response = await fetch(`${BASE_URL}/api/upload/files`)

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const data = await response.json()

        // Filter files by looking for names that contain "ScrollLogo"
        const scrollLogos = data.filter(
          (file) => file.name && file.name.includes("ScrollLogo")
        )

        console.log("Found scroll logos:", scrollLogos.length)

        // Map to full URLs
        const logoUrls = scrollLogos.map((file) => `${BASE_URL}${file.url}`)
        console.log("Logo URLs:", logoUrls)

        setClubLogos(logoUrls)
        setImagesLoaded(true)

        const timer = setTimeout(() => {
          setIsVisible(true)
        }, 100)

        return () => clearTimeout(timer)
      } catch (err) {
        console.error("Error fetching logos:", err)
        setError(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLogos()
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center bg-[#214A27]">
        <hr className="border-black w-full" />
        <div className="h-[75px] overflow-hidden flex items-center justify-center w-full mx-auto"></div>
        <hr className="border-black w-full" />
      </div>
    )
  }

  if (error) {
    console.error("Error:", error)
    return <p className="pt-[85px]">Something went wrong...</p>
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
