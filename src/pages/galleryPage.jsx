import { useState, useEffect } from "react"
import PageHeader from "../components/pageHeader"
import ImageGallery from "react-image-gallery"
import "react-image-gallery/styles/css/image-gallery.css"
import "./galleryPage.css"
import { API_URL, BASE_URL } from "../constants/api"
import { GalleryPageSkeleton } from "../components/skeletons"

const GalleryPage = () => {
  const [images, setImages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showGallery, setShowGallery] = useState(false)
  const [imagesPreloaded, setImagesPreloaded] = useState(false)
  const [fetchError, setFetchError] = useState(null)

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
        setFetchError(error.message)
        setIsLoading(false)
      }
    }

    loadImages()
  }, [])

  if (isLoading) {
    return <GalleryPageSkeleton />
  }

  if (fetchError) {
    return (
      <>
        <PageHeader title="Gallery" />
        <hr className="page-divider" />
        <div className="page-background">
          <div className="gallery-container">
            <div className="text-center text-red-600">
              <p>Error loading gallery: {fetchError}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-[#214A27] text-white px-4 py-2 rounded">
                Try Again
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader title="Gallery" />
      <hr className="page-divider" />
      <div className="page-background">
        <div className="gallery-container">
          {images.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-lg text-gray-700">
                No gallery images available at this time.
              </p>
            </div>
          ) : showGallery ? (
            <div
              className="gallery-ease-in"
              style={{
                opacity: showGallery ? 1 : 0,
                transition: "opacity 0.3s ease-in-out",
                minHeight: imagesPreloaded ? "auto" : "500px",
              }}>
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
