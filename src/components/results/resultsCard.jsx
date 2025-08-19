import { useState, useEffect } from "react"

const ResultsCard = ({ courseImage, name, comp, date, isLive, isToday }) => {
  // Add isLive and isToday props
  const [imageLoaded, setImageLoaded] = useState(false)
  const [cardReady, setCardReady] = useState(false)
  const [textReady, setTextReady] = useState(false)

  useEffect(() => {
    const img = new Image()
    img.src = courseImage
    img.onload = () => {
      setImageLoaded(true)
    }
    img.onerror = () => {
      setImageLoaded(true)
    }

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [courseImage])

  useEffect(() => {
    if (imageLoaded) {
      const cardTimer = setTimeout(() => {
        setCardReady(true)

        const textTimer = setTimeout(() => {
          setTextReady(true)
        }, 200)
        return () => clearTimeout(textTimer)
      }, 100)

      return () => clearTimeout(cardTimer)
    }
  }, [imageLoaded])

  const fadeInClass = "transition-all duration-500 ease-in-out"
  const textFadeClass = "transition-all duration-700 ease-in-out"
  const hiddenClass = "opacity-0 translate-y-4"
  const visibleClass = "opacity-100 translate-y-0"

  return (
    <div
      className={`p-4 bg-[#214A27] shadow-lg rounded-md max-w-[350px] w-full mx-auto ${fadeInClass} ${
        cardReady ? visibleClass : hiddenClass
      }`}>
      <div className="flex flex-col bg-[#D9D9D9] text-black border border-black relative w-full">
        {/* ADD THIS: Status Pills - Now inside the card structure */}
        {(isLive || isToday) && (
          <div
            className={`absolute top-2 right-2 z-10 ${fadeInClass} ${
              cardReady ? visibleClass : hiddenClass
            }`}>
            {isLive && (
              <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
                <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                LIVE
              </div>
            )}
            {!isLive && isToday && (
              <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                TODAY
              </div>
            )}
          </div>
        )}

        {/* Image Section */}
        <div className="relative">
          <div className="w-full h-[250px] bg-gray-300 absolute top-0 left-0" />
          <img
            src={courseImage}
            className={`w-full h-[250px] object-cover relative transition-opacity duration-700 ease-in-out ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            alt={`${name} course`}
          />
        </div>

        {/* Text Section (Name, Comp, Date) */}
        <div className="bg-[#D9D9D9]">
          <div
            className={`flex flex-col items-center text-center px-2 py-2 text-black ${textFadeClass} ${
              textReady ? visibleClass : hiddenClass
            }`}>
            <h2 className="text-xl font-bold">{name}</h2>
            <h3 className="text-md">{comp} competition</h3>
            <h3 className="text-md">{date}</h3>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultsCard
