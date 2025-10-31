import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MdAdd,
  MdDelete,
  MdPhotoCamera,
  MdImage,
  MdUpload,
} from "react-icons/md";

export interface PhotoFile {
  id: string;
  file: File | null;
  preview: string;
  type: "exterior" | "interior";
  isExisting?: boolean;
}

interface UploadCarPhotosProps {
  onPhotosChange?: (photos: { exterior: PhotoFile[]; interior: PhotoFile[] }) => void;
  initialPhotos?: { exterior: PhotoFile[]; interior: PhotoFile[] };
  disabled?: boolean;
}

const UploadCarPhotos: React.FC<UploadCarPhotosProps> = ({
  onPhotosChange,
  initialPhotos = { exterior: [], interior: [] },
  disabled = false,
}) => {
  const [photos, setPhotos] = useState<{ exterior: PhotoFile[]; interior: PhotoFile[] }>(initialPhotos);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Notify parent component when photos change
  useEffect(() => {
    onPhotosChange?.(photos);
  }, [photos, onPhotosChange]);

  const handleFileSelect = (files: FileList | null, type: "exterior" | "interior") => {
    if (!files) return;

    const newPhotos: PhotoFile[] = Array.from(files).map(file => ({
      id: generateId(),
      file,
      preview: URL.createObjectURL(file),
      type,
    }));

    setPhotos(prev => {
      const updated = {
        ...prev,
        [type]: [...prev[type], ...newPhotos]
      };
      return updated;
    });
  };

  const handleDragOver = (e: React.DragEvent, type: "exterior" | "interior") => {
    e.preventDefault();
    setDragOver(type);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
  };

  const handleDrop = (e: React.DragEvent, type: "exterior" | "interior") => {
    e.preventDefault();
    setDragOver(null);
    handleFileSelect(e.dataTransfer.files, type);
  };

  const removePhoto = (id: string, type: "exterior" | "interior") => {
    setPhotos(prev => {
      const updated = {
        ...prev,
        [type]: prev[type].filter(photo => photo.id !== id)
      };
      return updated;
    });
  };

  const openFileDialog = (type: "exterior" | "interior") => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute("data-type", type);
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const type = e.target.getAttribute("data-type") as "exterior" | "interior";
    handleFileSelect(e.target.files, type);
  };

  return (
    <div className="space-y-6">
      {/* Exterior Photos */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <MdPhotoCamera className="w-5 h-5 text-blue-600" />
          Exterior Photos
        </h3>
        
        <div
          className={`border-2 border-dashed rounded-xl p-6 transition-all duration-300 ${
            dragOver === "exterior"
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          onDragOver={(e) => handleDragOver(e, "exterior")}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, "exterior")}
          onClick={() => !disabled && openFileDialog("exterior")}
        >
          <div className="text-center">
            <MdUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600 mb-2">
              Drag & drop exterior photos here, or click to select
            </p>
            <p className="text-xs text-gray-500">
              Supports JPG, PNG, WebP (Max 10MB each)
            </p>
          </div>
        </div>

        {/* Exterior Photos Grid */}
        {photos.exterior.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.exterior.map((photo) => (
              <motion.div
                key={photo.id}
                className="relative group"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <img
                  src={photo.preview}
                  alt="Exterior"
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                />
                {!photo.isExisting && (
                  <button
                    onClick={() => removePhoto(photo.id, "exterior")}
                    disabled={disabled}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 disabled:opacity-50"
                  >
                    <MdDelete className="w-3 h-3" />
                  </button>
                )}
                {photo.isExisting && (
                  <div className="absolute top-1 right-1 bg-blue-500 text-white text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    Existing
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Interior Photos */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <MdImage className="w-5 h-5 text-green-600" />
          Interior Photos
        </h3>
        
        <div
          className={`border-2 border-dashed rounded-xl p-6 transition-all duration-300 ${
            dragOver === "interior"
              ? "border-green-400 bg-green-50"
              : "border-gray-300 hover:border-gray-400"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          onDragOver={(e) => handleDragOver(e, "interior")}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, "interior")}
          onClick={() => !disabled && openFileDialog("interior")}
        >
          <div className="text-center">
            <MdUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600 mb-2">
              Drag & drop interior photos here, or click to select
            </p>
            <p className="text-xs text-gray-500">
              Supports JPG, PNG, WebP (Max 10MB each)
            </p>
          </div>
        </div>

        {/* Interior Photos Grid */}
        {photos.interior.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.interior.map((photo) => (
              <motion.div
                key={photo.id}
                className="relative group"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <img
                  src={photo.preview}
                  alt="Interior"
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                />
                {!photo.isExisting && (
                  <button
                    onClick={() => removePhoto(photo.id, "interior")}
                    disabled={disabled}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 disabled:opacity-50"
                  >
                    <MdDelete className="w-3 h-3" />
                  </button>
                )}
                {photo.isExisting && (
                  <div className="absolute top-1 right-1 bg-blue-500 text-white text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    Existing
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Total Photos: {photos.exterior.length + photos.interior.length}
          </span>
          <div className="flex gap-4">
            <span className="text-blue-600">
              Exterior: {photos.exterior.length}
            </span>
            <span className="text-green-600">
              Interior: {photos.interior.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadCarPhotos;
