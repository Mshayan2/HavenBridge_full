import React from 'react';
import { FaEye, FaClock, FaMapMarkerAlt, FaCamera, FaBed, FaBath, FaRulerCombined, FaCheckCircle, FaQuestionCircle, FaCommentDots, FaPhone } from 'react-icons/fa';

const PreviewSidebar = ({ formData }) => {
  const getPricePreview = () => {
    if (!formData.price) return 'PKR 0';
    const price = parseFloat(formData.price);
    if (price >= 10000000) return `PKR ${(price / 10000000).toFixed(1)} Crore`;
    if (price >= 100000) return `PKR ${(price / 100000).toFixed(1)} Lac`;
    return `PKR ${price.toLocaleString()}`;
  };

  const listingType = String(formData.listingType || 'sale').toLowerCase();
  const isRent = listingType === 'rent';

  return (
    <div className="sticky top-24 space-y-8">
      {/* Preview Card */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-teal-100">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-teal-100">
          <h3 className="text-xl font-bold text-teal-900">Live Preview</h3>
          <span className="text-sm text-gray-500 bg-teal-50 px-3 py-1 rounded-full flex items-center gap-2">
            <FaClock /> {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-500 mb-2">{isRent ? 'Monthly Rent' : 'Asking Price'}</p>
            <p className="text-2xl font-bold text-teal-700">
              {getPricePreview()}{isRent ? ' / month' : ''}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-2">Property Title</p>
            <p className="font-medium text-gray-800">
              {formData.propertyName || `${formData.bedrooms} Bed ${formData.propertyType} for ${isRent ? 'Rent' : 'Sale'}`}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-2">Location</p>
            <p className="font-medium text-gray-800 flex items-center gap-2">
              <FaMapMarkerAlt className="text-teal-500" />
              {formData.city || 'City'}, {formData.area || 'Area'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-2">Property Details</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-teal-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <FaRulerCombined /> Size
                </p>
                <p className="font-semibold text-teal-700">
                  {formData.size || '0'} {formData.sizeUnit}
                </p>
              </div>
              <div className="bg-teal-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Rooms</p>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-teal-700 flex items-center gap-1">
                    <FaBed /> {formData.bedrooms}
                  </span>
                  <span className="font-semibold text-teal-700 flex items-center gap-1">
                    <FaBath /> {formData.bathrooms}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-2">Key Features</p>
            <div className="flex flex-wrap gap-2">
              {formData.features.slice(0, 6).map((feature, index) => (
                <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                  {feature}
                </span>
              ))}
              {formData.features.length > 6 && (
                <span className="text-xs text-gray-500">+{formData.features.length - 6} more</span>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-2">Photos</p>
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <FaCamera className="text-teal-500" />
              </div>
              <div>
                <p className="font-medium text-gray-800">{formData.photos.length} photos uploaded</p>
                {/* <p className="text-xs text-gray-500">Click to view gallery</p> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewSidebar;