import { useState, useEffect } from "react";
import PageHeader from "../components/pageHeader";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";

const importAllImages = async (context) => {
  const images = {};
  const modules = await Promise.all(
    Object.entries(context).map(([key, value]) =>
      value().then((mod) => [key, mod.default])
    )
  );

  modules.forEach(([key, value]) => {
    images[key] = value;
  });

  return images;
};

const GalleryPage = () => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const loadImages = async () => {
      const courseContext = import.meta.glob(
        "../assets/courses/*.{png,jpg,jpeg,svg}"
      );

      const courseImages = await importAllImages(courseContext);

      const courseImageArray = Object.keys(courseImages).map((key) => ({
        original: courseImages[key],
        thumbnail: courseImages[key],
      }));

      setImages(courseImageArray);
    };

    loadImages();
  }, []);

  return (
    <>
      <PageHeader title="Gallery" />
      <hr className="border-black" />
      <div className="bg-[#D9D9D9] h-screen">
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-start">
          <ImageGallery items={images} infinite={true} showIndex={true} />
        </div>
      </div>
      <hr className="border-black" />
    </>
  );
};

export default GalleryPage;
