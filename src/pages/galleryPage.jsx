import { useState, useEffect } from "react";
import PageHeader from "../components/pageHeader";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import { API_URL, BASE_URL } from "../constants/api";

const GalleryPage = () => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const loadImages = async () => {
      try {
        const response = await fetch(`${API_URL}/upload/files`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const courseImageArray = data
          .filter(
            (image) =>
              !image.name.toUpperCase().includes("LOGO") &&
              !image.url.toUpperCase().includes("LOGO")
          )
          .map((image) => ({
            original: `${BASE_URL}${image.url}`,
            thumbnail: `${BASE_URL}${image.url}`,
          }));

        setImages(courseImageArray);
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };

    loadImages();
  }, []);

  return (
    <>
      <PageHeader title="Gallery" />
      <hr className="border-black" />
      <div className="bg-[#D9D9D9] h-full">
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-start">
          <ImageGallery
            eagerload={true}
            items={images}
            infinite={true}
            showIndex={true}
          />
        </div>
      </div>
    </>
  );
};

export default GalleryPage;
