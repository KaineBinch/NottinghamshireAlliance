import { useState, useEffect } from "react"
import { queryBuilder } from "../../utils/queryBuilder"
import { BASE_URL, MODELS, QUERIES } from "../../constants/api"
import useFetch from "../../utils/hooks/useFetch"
import ScrollingImages from "./scrollingImages"

const LogoScroller = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const query = queryBuilder(MODELS.golfClubs, QUERIES.clubsQuery)
  const { isLoading, isError, data, error } = useFetch(query)

  useEffect(() => {
    if (!isLoading && data?.data) {
      setImagesLoaded(true)

      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [isLoading, data])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center bg-[#214A27]">
        <hr className="border-black w-full" />
        <div className="h-[75px] overflow-hidden flex items-center justify-center w-full mx-auto"></div>
        <hr className="border-black w-full" />
      </div>
    )
  }

  if (isError) {
    console.error("Error:", error)
    return <p className="pt-[85px]">Something went wrong...</p>
  }

  const clubLogos =
    data?.data
      ?.filter(
        (club) => club.clubLogo && club.clubLogo[0] && club.clubLogo[0].url
      )
      .map((club) => `${BASE_URL}${club.clubLogo[0].url}`) || []

  return (
    <div className="flex flex-col items-center bg-[#214A27]">
      <hr className="border-black w-full" />
      <div
        className="h-[75px] overflow-hidden flex items-center justify-center w-full mx-auto"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.8s ease-in-out",
        }}>
        {imagesLoaded && (
          <ScrollingImages
            images={clubLogos}
            velocity={-50}
            isVisible={isVisible}
          />
        )}
      </div>
      <hr className="border-black w-full" />
    </div>
  )
}

export default LogoScroller
