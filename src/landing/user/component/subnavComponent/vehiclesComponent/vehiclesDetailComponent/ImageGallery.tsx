// src/components/ImageGallery.tsx
import React, { useState } from "react";
import { AiOutlineClose, AiOutlineLeft, AiOutlineRight } from "react-icons/ai"; // Import icons for navigation and close

interface ImageGalleryProps {
  images: string[]; // Array of image URLs
  vehicleName: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, vehicleName }) => {
  const [mainImage, setMainImage] = useState(images[0]); // State for the currently displayed main image
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
  const [currentModalImageIndex, setCurrentModalImageIndex] = useState(0); // State for the image index in the modal

  const openModal = (imageIndex: number) => {
    setCurrentModalImageIndex(imageIndex);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const showNextImage = () => {
    setCurrentModalImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const showPrevImage = () => {
    setCurrentModalImageIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center">
      {/* Main Image Display */}
      <div
        className="w-full h-96 mb-4 rounded-lg overflow-hidden cursor-pointer"
        onClick={() => openModal(images.indexOf(mainImage))} // Open modal with the current main image
      >
        <img
          src={mainImage}
          alt={vehicleName}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>

      {/* Thumbnail Gallery */}
      <div className="flex space-x-3 overflow-x-auto w-full justify-center">
        {images.map((image, index) => (
          <div
            key={index}
            className={`w-24 h-20 flex-shrink-0 cursor-pointer rounded-md overflow-hidden transition-all duration-300 ${
              mainImage === image ? "ring-2 ring-blue-500" : ""
            }`}
            onClick={() => setMainImage(image)} // Set as main image on click
          >
            <img
              src={image}
              alt={`${vehicleName} thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Image Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative bg-white p-4 rounded-lg shadow-xl max-w-4xl max-h-[90vh] flex flex-col items-center">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-700 hover:text-gray-900 transition-colors bg-white rounded-full p-2 z-10"
            >
              <AiOutlineClose size={24} />
            </button>

            {/* Modal Image */}
            <div className="w-full max-h-[70vh] flex justify-center items-center mb-4">
              <img
                src={images[currentModalImageIndex]}
                alt={`${vehicleName} ${currentModalImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={showPrevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-md hover:bg-gray-100 transition-colors z-10"
            >
              <AiOutlineLeft size={24} />
            </button>
            <button
              onClick={showNextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-md hover:bg-gray-100 transition-colors z-10"
            >
              <AiOutlineRight size={24} />
            </button>

            {/* Modal Thumbnails (Optional, can be added for quick navigation inside modal) */}
            {/* <div className="flex space-x-2 overflow-x-auto justify-center mt-4">
              {images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Modal thumbnail ${index + 1}`}
                  className={`w-16 h-14 object-cover rounded-md cursor-pointer ${
                    currentModalImageIndex === index ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => setCurrentModalImageIndex(index)}
                />
              ))}
            </div> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
