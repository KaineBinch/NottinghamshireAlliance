import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

const CourseCard = ({ name, address, contact, link, courseImage, logo }) => {
  const [mainImageLoaded, setMainImageLoaded] = useState(false)
  const [logoLoaded, setLogoLoaded] = useState(false)

  return (
    <>
      <div className="flex">
        <div className="relative flex w-2/5 h-50 md:h-60 bg-gray-300">
          <div
            className={`absolute inset-0 transition-opacity duration-300 ${
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

          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 z-10">
            <div
              className={`bg-gray-300 rounded-full md:w-[100px] md:h-[100px] w-[75px] h-[75px] flex items-center justify-center ${
                logoLoaded ? "hidden" : "block"
              }`}
            />
            <img
              src={logo}
              className={`md:max-w-[100px] md:max-h-[100px] max-w-[75px] max-h-[75px] transition-opacity duration-300 ${
                logoLoaded ? "opacity-100" : "opacity-0"
              }`}
              alt="logo"
              onLoad={() => setLogoLoaded(true)}
            />
          </div>
        </div>

        <div className="flex flex-col w-3/5 text-start pl-5 md:pl-10 justify-center">
          <div className="font-bold text-xl md:text-2xl py-4">{name}</div>
          <div className="pb-4 md:text-lg">{address}</div>
          <div className="flex items-center justify-between md:text-lg">
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

      <hr className="my-4 border-[#A0A0A0] ml-auto w-2/4 md:mr-8 mr-2" />
    </>
  )
}

export default CourseCard
