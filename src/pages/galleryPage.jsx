import { useState, useEffect } from "react"
import PageHeader from "../components/pageHeader"
import ImageGallery from "react-image-gallery"
import "react-image-gallery/styles/css/image-gallery.css"
import { API_URL, BASE_URL } from "../constants/api"
import Spinner from "../components/helpers/spinner"

const GalleryPage = () => {
  const [images, setImages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showGallery, setShowGallery] = useState(false)
  const [imagesPreloaded, setImagesPreloaded] = useState(false)

  useEffect(() => {
    const loadImages = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`${API_URL}/upload/files`)
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const data = await response.json()
        const courseImageArray = data
          .filter(
            (image) =>
              !image.name.toUpperCase().includes("LOGO") &&
              !image.url.toUpperCase().includes("LOGO")
          )
          .map((image) => ({
            original: `${BASE_URL}${image.url}`,
            thumbnail: `${BASE_URL}${image.url}`,
          }))

        setImages(courseImageArray)

        if (courseImageArray.length > 0) {
          const preloadPromises = courseImageArray.slice(0, 6).map((img) => {
            return new Promise((resolve) => {
              const image = new Image()
              image.src = img.original
              image.onload = resolve
              image.onerror = resolve
            })
          })

          Promise.all(preloadPromises).then(() => {
            setImagesPreloaded(true)
            setIsLoading(false)
            setTimeout(() => {
              setShowGallery(true)
            }, 100)
          })
        } else {
          setImagesPreloaded(true)
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Error fetching images:", error)
        setIsLoading(false)
      }
    }

    loadImages()
  }, [])

  return (
    <>
      <PageHeader title="Gallery" />
      <hr className="border-black" />
      <div className="bg-[#D9D9D9] min-h-[500px]">
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-start">
          {isLoading ? (
            <Spinner size="xl" color="#214A27" />
          ) : showGallery ? (
            <div
              className="gallery-ease-in"
              style={{ minHeight: imagesPreloaded ? "auto" : "500px" }}>
              <ImageGallery
                eagerload={true}
                items={images}
                infinite={true}
                showIndex={true}
                lazyLoad={false}
                slideDuration={450}
              />
            </div>
          ) : null}
        </div>
      </div>
    </>
  )
}

export default GalleryPage
