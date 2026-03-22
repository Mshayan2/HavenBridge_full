import React, { useRef, useState } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';

const FeaturesPhotos = ({ formData, handleArrayChange, handleFileChange, nextStep, prevStep }) => {
  const [photosPreview, setPhotosPreview] = useState([]);
  const fileInputRef = useRef();

  const handlePhotosUpload = (e) => {
    const files = Array.from(e.target.files);
    handleFileChange('photos', [...formData.photos, ...files]);

    const previews = files.map(file => URL.createObjectURL(file));
    setPhotosPreview([...photosPreview, ...previews]);
  };

  const removePhoto = (index) => {
    const newPhotos = [...formData.photos];
    newPhotos.splice(index, 1);
    handleFileChange('photos', newPhotos);

    const newPreviews = [...photosPreview];
    newPreviews.splice(index, 1);
    setPhotosPreview(newPreviews);
  };

  const handleFeaturesChange = (feature) => {
    let updatedFeatures = [...formData.features];
    if (updatedFeatures.includes(feature)) {
      updatedFeatures = updatedFeatures.filter(f => f !== feature);
    } else {
      updatedFeatures.push(feature);
    }
    handleArrayChange('features', updatedFeatures);
  };

  const featuresList = ['Pool', 'Garage', 'Garden', 'Gym', 'Security', 'Elevator'];

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-teal-900">Property Features</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {featuresList.map((feature) => (
          <button
            key={feature}
            type="button"
            onClick={() => handleFeaturesChange(feature)}
            className={`py-2 px-4 rounded-lg border ${
              formData.features.includes(feature) ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {feature}
          </button>
        ))}
      </div>

      <h3 className="text-xl font-bold mb-4 text-teal-900">Property Photos</h3>
      <div
        onClick={() => fileInputRef.current.click()}
        className="border-2 border-dashed border-gray-300 p-6 rounded-lg text-center cursor-pointer hover:border-teal-600 transition-all"
      >
        <FaPlus className="mx-auto text-2xl text-teal-500 mb-2" />
        <p>Click or Drag & Drop to upload photos</p>
        <input
          type="file"
          multiple
          accept="image/*"
          ref={fileInputRef}
          onChange={handlePhotosUpload}
          className="hidden"
        />
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-4">
        {photosPreview.map((src, idx) => (
          <div key={idx} className="relative">
            <img src={src} alt={`Preview ${idx}`} className="w-full h-24 object-cover rounded-lg" />
            <button
              type="button"
              onClick={() => removePhoto(idx)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
            >
              <FaTimes />
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-6">
        <button onClick={prevStep} className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">Previous</button>
        <button onClick={nextStep} className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700">Next</button>
      </div>
    </div>
  );
};

export default FeaturesPhotos;
