import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

const CourseCard = ({ name, address, contact, link, courseImage, logo }) => {
  const [mainImageLoaded, setMainImageLoaded] = useState(false)
  const [logoLoaded, setLogoLoaded] = useState(false)
  const [showLogo, setShowLogo] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (mainImageLoaded && logoLoaded) {
      const timer = setTimeout(() => {
        setShowLogo(true)
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [mainImageLoaded, logoLoaded])

  const fadeInClass = "transition-all duration-700 ease-in-out"
  const hiddenClass = "opacity-0 translate-y-4"
  const visibleClass = "opacity-100 translate-y-0"

  return (
    <div className={`${fadeInClass} ${isVisible ? visibleClass : hiddenClass}`}>
      <div className="flex">
        <div className="relative flex w-2/5 h-50 md:h-60 bg-gray-300">
          <div
            className={`absolute inset-0 transition-opacity duration-700 ${
              mainImageLoaded ? "opacity-100" : "opacity-0"
            }`}
            style={{
              backgroundImage: `url(${courseImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}>
            <img
              src={courseImage}
              className="hidden"
              alt=""
              onLoad={() => setMainImageLoaded(true)}
            />
          </div>

          <div
            className={`absolute bottom-3 left-1/2 transform -translate-x-1/2 z-10 ${fadeInClass} ${
              isVisible ? visibleClass : hiddenClass
            }`}
            style={{ transitionDelay: "300ms" }}>
            <div className="relative md:w-[100px] md:h-[100px] w-[75px] h-[75px] flex items-center justify-center">
              <div
                className={`absolute transition-opacity duration-500 ${
                  showLogo ? "opacity-0" : "opacity-100"
                }`}
              />
              {/* Logo with delayed appearance */}
              <img
                src={logo}
                className={`absolute inset-0 object-contain w-full h-full transition-opacity duration-500 ${
                  showLogo ? "opacity-100" : "opacity-0"
                }`}
                alt="logo"
                onLoad={() => setLogoLoaded(true)}
              />
            </div>
          </div>
        </div>

        <div
          className={`flex flex-col w-3/5 text-start pl-5 md:pl-10 justify-center ${fadeInClass} ${
            isVisible ? visibleClass : hiddenClass
          }`}
          style={{ transitionDelay: "200ms" }}>
          <div
            className={`font-bold text-xl md:text-2xl py-4 ${fadeInClass} ${
              isVisible ? visibleClass : hiddenClass
            }`}
            style={{ transitionDelay: "300ms" }}>
            {name}
          </div>
          <div
            className={`pb-4 md:text-lg ${fadeInClass} ${
              isVisible ? visibleClass : hiddenClass
            }`}
            style={{ transitionDelay: "400ms" }}>
            {address}
          </div>
          <div
            className={`flex items-center justify-between md:text-lg ${fadeInClass} ${
              isVisible ? visibleClass : hiddenClass
            }`}
            style={{ transitionDelay: "500ms" }}>
            <a href={`tel:${contact}`}>
              <FontAwesomeIcon
                icon="fa-solid fa-phone"
                className="mr-1 md:pr-2"
              />
              {contact}
            </a>
            <a
              className="btn border-black rounded-none md:text-lg"
              href={link}
              target="_blank"
              rel="noreferrer">
              Visit
            </a>
          </div>
        </div>
      </div>

      <hr
        className={`my-4 border-[#A0A0A0] ml-auto w-2/4 md:mr-8 mr-2 ${fadeInClass} ${
          isVisible ? visibleClass : hiddenClass
        }`}
        style={{ transitionDelay: "600ms" }}
      />
    </div>
  )
}

export default CourseCard
