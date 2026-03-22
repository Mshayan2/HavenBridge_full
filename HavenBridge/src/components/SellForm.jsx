import React, { useRef, useEffect } from 'react';
import CustomDropdown from './CustomDropdown';
import {
  FaHome, FaTag, FaCalendarAlt, FaMapMarkerAlt, FaCity, FaMapPin,
  FaRulerCombined, FaBed, FaBath, FaCalendar, FaBuilding,
  FaDollarSign, FaEdit, FaCamera, FaUpload, FaInfoCircle,
  FaPhone, FaEnvelope, FaWhatsapp, FaComment,
  FaSave, FaPaperPlane, FaArrowLeft, FaArrowRight,
  FaFile, FaFileInvoice, FaFileInvoiceDollar, FaIdCard, FaShieldAlt
} from 'react-icons/fa';

import { FaPlus, FaTimes, FaCheck } from 'react-icons/fa';
import {
  MdApartment, MdVilla, MdLandscape, MdStorefront,
  MdAgriculture, MdStraighten, MdNumbers, MdLocationCity,
  MdDescription, MdAddCircle, MdPhotoCamera, MdDelete,
  MdPerson, MdAccessTime
} from 'react-icons/md';

const SellForm = ({ currentStep, formData, updateFormData, nextStep, prevStep, saveDraft, submitForm }) => {
  const fileInputRef = useRef(null);
  const formRef = useRef(null);

  // When the step changes, scroll the form into view below the fixed header
  // NOTE: skip the first effect run (initial mount) to avoid jumping when the page is opened.
  const mountedRef = React.useRef(false);
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    const el = formRef.current;
    if (!el) return;
    const header = document.querySelector('header');
    const headerHeight = header && header.offsetHeight ? header.offsetHeight : 0;
    const top = el.getBoundingClientRect().top + window.scrollY - headerHeight - 12;
    try {
      window.scrollTo({ top: Math.max(0, top), left: 0, behavior: 'smooth' });
    } catch (_e) {
      window.scrollTo(0, Math.max(0, top));
    }
  }, [currentStep]);

  const propertyTypes = [
    { value: 'House', icon: <FaHome className="text-2xl" /> },
    { value: 'Apartment', icon: <MdApartment className="text-2xl" /> },
    { value: 'Villa', icon: <MdVilla className="text-2xl" /> },
    { value: 'Plot', icon: <MdLandscape className="text-2xl" /> },
    { value: 'Commercial', icon: <MdStorefront className="text-2xl" /> },
    { value: 'Farmhouse', icon: <MdAgriculture className="text-2xl" /> }
  ];

  const propertySubtypes = ['House', 'Flat', 'Lower Portion', 'Upper Portion', 'Room', 'Farm House'];
  const CITIES = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta'];
  const sizeUnits = ['Marla', 'Kanal', 'Sq. Ft.', 'Sq. Yd', 'Sq. M.', 'Acre'];
  const bedroomOptions = ['Studio', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'];
  const bathroomOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'];
  const conditions = ['New / Under Construction', 'Excellent', 'Good', 'Needs Renovation', 'Fully Furnished', 'Semi Furnished'];
  const contactMethods = [
    { value: 'phone', icon: FaPhone, label: 'Phone' },
    { value: 'email', icon: FaEnvelope, label: 'Email' },
    { value: 'whatsapp', icon: FaWhatsapp, label: 'WhatsApp' },
    { value: 'all', icon: FaComment, label: 'All' }
  ];

  const handleFeatureAdd = () => {
    if (formData.newFeature.trim()) {
      updateFormData('features', [...formData.features, formData.newFeature.trim()]);
      updateFormData('newFeature', '');
    }
  };

  const handleFeatureRemove = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    updateFormData('features', newFeatures);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPhotos = [...formData.photos, ...files.slice(0, 12 - formData.photos.length)];
    updateFormData('photos', newPhotos);
  };

  const handlePhotoRemove = (index) => {
    const newPhotos = formData.photos.filter((_, i) => i !== index);
    updateFormData('photos', newPhotos);
  };

  const triggerFileUpload = () => {
    fileInputRef.current.click();
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter' && action) {
      e.preventDefault();
      action();
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 border border-teal-100">
            <h2 className="text-xl sm:text-2xl font-bold text-teal-900 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
              <FaHome className="text-teal-600 text-lg sm:text-xl" /> Property Basics
            </h2>
            <h3 className="text-lg sm:text-xl font-bold text-teal-900 mb-3 sm:mb-4">Property Type</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-2 sm:gap-3 mb-6 sm:mb-8">
              {propertyTypes.map((type) => (
                <button
                  type="button"
                  key={type.value}
                  onClick={() => updateFormData('propertyType', type.value)}
                  className={`py-3 sm:py-4 px-2 sm:px-3 rounded-lg border-2 text-center font-medium transition-all flex flex-col items-center gap-1 sm:gap-2 ${formData.propertyType === type.value ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-gray-200 hover:border-teal-300 hover:bg-teal-50'}`}
                >
                  <span className="text-xl sm:text-2xl">{type.icon}</span>
                  <span className="text-xs sm:text-sm md:text-base">{type.value}</span>
                </button>
              ))}
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-teal-900 mb-3 sm:mb-4">Property Subtype</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-2 sm:gap-3">
              {propertySubtypes.map((subtype) => (
                <button
                  type="button"
                  key={subtype}
                  onClick={() => updateFormData('propertySubtype', subtype)}
                  className={`py-2 sm:py-3 px-1 sm:px-2 rounded-lg border-2 text-center font-medium text-xs sm:text-sm md:text-base ${formData.propertySubtype === subtype ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-gray-200 hover:border-teal-300 hover:bg-teal-50'}`}
                >
                  {subtype}
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 border border-teal-100">
            <h2 className="text-xl sm:text-2xl font-bold text-teal-900 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
              <FaMapMarkerAlt className="text-teal-600 text-lg sm:text-xl" /> Location Details
            </h2>

            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="flex text-sm font-medium text-gray-700 mb-2 items-center gap-1 sm:gap-2">
                  <FaCity className="text-teal-500 text-sm sm:text-base" />
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => updateFormData('city', e.target.value)}
                  placeholder="e.g., Lahore, Karachi, Islamabad"
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-teal-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="flex text-sm font-medium text-gray-700 mb-2 items-center gap-1 sm:gap-2">
                  <FaMapMarkerAlt className="text-teal-500 text-sm sm:text-base" />
                  Area / Society *
                </label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => updateFormData('area', e.target.value)}
                  placeholder="e.g., DHA Phase 5, Gulberg, Bahria Town"
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-teal-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="flex text-sm font-medium text-gray-700 mb-2 items-center gap-1 sm:gap-2">
                  <FaMapPin className="text-teal-500 text-sm sm:text-base" />
                  Complete Address *
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => updateFormData('address', e.target.value)}
                  rows="3"
                  placeholder="House No., Street, Block, Sector, Landmarks"
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-teal-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition resize-none text-sm sm:text-base"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex text-sm font-medium text-gray-700 mb-2 items-center gap-1 sm:gap-2">
                    <FaMapMarkerAlt className="text-teal-500 text-sm sm:text-base" />
                    Latitude (optional)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.lat || ''}
                    onChange={(e) => updateFormData('lat', e.target.value)}
                    placeholder="e.g., 31.5204"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-teal-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="flex text-sm font-medium text-gray-700 mb-2 items-center gap-1 sm:gap-2">
                    <FaMapMarkerAlt className="text-teal-500 text-sm sm:text-base" />
                    Longitude (optional)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.lng || ''}
                    onChange={(e) => updateFormData('lng', e.target.value)}
                    placeholder="e.g., 74.3587"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-teal-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition text-sm sm:text-base"
                  />
                </div>
              </div>

              <p className="text-xs text-gray-600">
                If you provide coordinates, your property can appear in map search. Leave blank if you’re not sure.
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 border border-teal-100">
            <h2 className="text-xl sm:text-2xl font-bold text-teal-900 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
              <FaRulerCombined className="text-teal-600 text-lg sm:text-xl" /> Property Specifications
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <div>
                <label className="flex text-sm font-medium text-gray-700 mb-2 items-center gap-1 sm:gap-2">
                  <FaRulerCombined className="text-teal-500 text-sm sm:text-base" />
                  Property Size *
                </label>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <input
                    type="number"
                    value={formData.size}
                    onChange={(e) => updateFormData('size', e.target.value)}
                    placeholder="e.g., 500"
                    required
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 border-teal-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition text-sm sm:text-base"
                  />
                  <CustomDropdown
                    label=""
                    options={sizeUnits}
                    selected={formData.sizeUnit || "Select Unit"}
                    setSelected={(value) => updateFormData('sizeUnit', value.toLowerCase())}
                    variant="form"
                  />
                  {/* <select
                    value={formData.sizeUnit}
                    onChange={(e) => updateFormData('sizeUnit', e.target.value)}
                    className="px-3 py-2 sm:py-3 border-2 border-teal-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition bg-white cursor-pointer hover:border-teal-300 min-w-24 text-sm sm:text-base"
                  >
                    {sizeUnits.map(unit => (
                      <option key={unit} value={unit.toLowerCase()} className="text-gray-700">{unit}</option>
                    ))}
                  </select> */}
                </div>
              </div>

              <div>
                <label className="flex text-sm font-medium text-gray-700 mb-2.5 items-center gap-1 sm:gap-2">
                  <FaCalendar className="text-teal-500 text-sm sm:text-base" />
                  Year Built
                </label>
                <input
                  type="number"
                  value={formData.yearBuilt}
                  onChange={(e) => updateFormData('yearBuilt', e.target.value)}
                  placeholder="e.g., 2018"
                  min="1900"
                  max="2025"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-teal-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition text-sm sm:text-base"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <div>
                <label className="flex text-sm font-medium text-gray-700 mb-2 items-center gap-1 sm:gap-2">
                  <FaBed className="text-teal-500 text-sm sm:text-base" />
                  Bedrooms
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-1 sm:gap-2">
                  {bedroomOptions.map(option => (
                    <button
                      type="button"
                      key={option}
                      onClick={() => updateFormData('bedrooms', option)}
                      className={`py-2 sm:py-3 rounded-lg border-2 font-medium text-xs sm:text-sm ${formData.bedrooms === option ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-gray-200 hover:border-teal-300 hover:bg-teal-50'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex text-sm font-medium text-gray-700 mb-2 items-center gap-1 sm:gap-2">
                  <FaBath className="text-teal-500 text-sm sm:text-base" />
                  Bathrooms
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-1 sm:gap-2">
                  {bathroomOptions.map(option => (
                    <button
                      type="button"
                      key={option}
                      onClick={() => updateFormData('bathrooms', option)}
                      className={`py-2 sm:py-3 rounded-lg border-2 font-medium text-xs sm:text-sm ${formData.bathrooms === option ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-gray-200 hover:border-teal-300 hover:bg-teal-50'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="flex text-sm font-medium text-gray-700 mb-2 items-center gap-1 sm:gap-2">
                <FaBuilding className="text-teal-500 text-sm sm:text-base" />
                Property Condition
              </label>
              <CustomDropdown
                label=""
                options={conditions}
                selected={formData.condition || "Select Condition"}
                setSelected={(value) => updateFormData('condition', value)}
                variant="form"
              />
              {/* <select
                value={formData.condition}
                onChange={(e) => updateFormData('condition', e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-teal-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition bg-white cursor-pointer hover:border-teal-300 text-sm sm:text-base"
              >
                <option value="" disabled className="text-gray-400">Select Condition</option>
                {conditions.map(condition => (
                  <option key={condition} value={condition} className="text-gray-700">{condition}</option>
                ))}
              </select> */}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 border border-teal-100">
            <h2 className="text-xl sm:text-2xl font-bold text-teal-900 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
              <FaDollarSign className="text-teal-600 text-lg sm:text-xl" /> Pricing & Description
            </h2>

            <div className="space-y-4 sm:space-y-6">
              {/* Listing intent */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Listing Type *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateFormData('listingType', 'sale')}
                    className={`py-2 sm:py-3 rounded-lg border-2 font-medium text-sm sm:text-base transition ${String(formData.listingType || 'sale') === 'sale'
                      ? 'border-teal-600 bg-teal-50 text-teal-700'
                      : 'border-gray-200 hover:border-teal-300 hover:bg-teal-50'}`}
                  >
                    For Sale
                  </button>
                  <button
                    type="button"
                    onClick={() => updateFormData('listingType', 'rent')}
                    className={`py-2 sm:py-3 rounded-lg border-2 font-medium text-sm sm:text-base transition ${String(formData.listingType || 'sale') === 'rent'
                      ? 'border-teal-600 bg-teal-50 text-teal-700'
                      : 'border-gray-200 hover:border-teal-300 hover:bg-teal-50'}`}
                  >
                    For Rent
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-2">Choose rent to list monthly rent and enable lease requests.</p>
              </div>

              <div>
                <label className="flex text-sm font-medium text-gray-700 mb-2 items-center gap-1 sm:gap-2">
                  <FaDollarSign className="text-teal-500 text-sm sm:text-base" />
                  {String(formData.listingType || 'sale') === 'rent' ? 'Monthly Rent *' : 'Asking Price *'}
                </label>
                <div className="relative">
                  <FaDollarSign className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => updateFormData('price', e.target.value)}
                    placeholder={String(formData.listingType || 'sale') === 'rent' ? 'Enter monthly rent in PKR' : 'Enter price in PKR'}
                    required
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 border-2 border-teal-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition text-sm sm:text-base"
                  />
                </div>
              </div>

              {String(formData.listingType || 'sale') === 'rent' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Security Deposit (optional)</label>
                    <div className="relative">
                      <FaDollarSign className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        value={formData.rentalDeposit || ''}
                        onChange={(e) => updateFormData('rentalDeposit', e.target.value)}
                        placeholder="Enter deposit in PKR"
                        className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 border-2 border-teal-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Lease Term *</label>
                    <select
                      value={formData.rentalMinTermMonths || '6'}
                      onChange={(e) => updateFormData('rentalMinTermMonths', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-teal-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition bg-white cursor-pointer hover:border-teal-300 text-sm sm:text-base"
                    >
                      {[3, 6, 9, 12, 18, 24].map((m) => (
                        <option key={m} value={String(m)}>{m} months</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : null}

              <div>
                <label className="flex text-sm font-medium text-gray-700 mb-2 items-center gap-1 sm:gap-2">
                  <FaEdit className="text-teal-500 text-sm sm:text-base" />
                  Property Title *
                </label>
                <input
                  type="text"
                  value={formData.propertyName}
                  onChange={(e) => updateFormData('propertyName', e.target.value)}
                  placeholder="e.g., Modern 3-Bedroom Luxury Apartment in DHA"
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-teal-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="flex text-sm font-medium text-gray-700 mb-2 items-center gap-1 sm:gap-2">
                  <FaEdit className="text-teal-500 text-sm sm:text-base" />
                  Property Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  rows="4"
                  placeholder="Describe your property in detail..."
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-teal-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition resize-none text-sm sm:text-base"
                ></textarea>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 border border-teal-100">
            <h2 className="text-xl sm:text-2xl font-bold text-teal-900 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
              <FaTag className="text-teal-600 text-lg sm:text-xl" /> Features & Photos
            </h2>

            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Features & Amenities
                </label>
                <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-3">
                  {formData.features.map((feature, index) => (
                    <span key={index} className="bg-teal-100 text-teal-800 px-2 sm:px-3 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2">
                      {feature}
                      <button
                        type="button"
                        onClick={() => handleFeatureRemove(index)}
                        className="text-teal-600 hover:text-teal-800 text-xs sm:text-sm"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={formData.newFeature}
                    onChange={(e) => updateFormData('newFeature', e.target.value)}
                    placeholder="Add feature (e.g., swimming pool, gym, garden)"
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 border-teal-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition text-sm sm:text-base"
                    onKeyPress={(e) => handleKeyPress(e, handleFeatureAdd)}
                  />
                  <button
                    type="button"
                    onClick={handleFeatureAdd}
                    className="px-4 py-2 sm:py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors text-sm sm:text-base"
                  >
                    ADD
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Photos *
                </label>
                <p className="text-gray-600 mb-3 sm:mb-4 flex items-start sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                  <FaInfoCircle className="text-teal-500 text-sm sm:text-base mt-0.5 sm:mt-0" />
                  Properties with high-quality images generate <strong>8x more leads</strong>.
                </p>

                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div
                  onClick={triggerFileUpload}
                  className="border-2 border-dashed border-teal-300 rounded-xl p-4 sm:p-6 md:p-8 text-center bg-teal-50 hover:bg-teal-100 transition cursor-pointer"
                >
                  <FaUpload className="text-teal-500 text-2xl sm:text-3xl md:text-4xl mx-auto mb-2 sm:mb-4" />
                  <p className="text-teal-700 font-medium text-sm sm:text-base md:text-lg">Drag & drop photos here or click to browse</p>
                  <p className="text-gray-500 text-xs sm:text-sm mt-1 sm:mt-2">Upload up to 12 high-quality photos (5MB max each)</p>
                </div>
              </div>

              {formData.photos.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
                    Uploaded Photos ({formData.photos.length}/12)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                    {formData.photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                          {photo instanceof File ? (
                            <img
                              src={URL.createObjectURL(photo)}
                              alt={`Property ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FaCamera className="text-gray-400 text-xl sm:text-2xl" />
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handlePhotoRemove(index)}
                          className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition shadow-lg"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 border border-teal-100">
            <h2 className="text-xl sm:text-2xl font-bold text-teal-900 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
              <FaPhone className="text-teal-600 text-lg sm:text-xl" /> Contact Information
            </h2>

            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.ownerName}
                    onChange={(e) => updateFormData('ownerName', e.target.value)}
                    placeholder="Your full name"
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-teal-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <CustomDropdown
                      label=""
                      options={["🇵🇰 +92", "🇺🇸 +1", "🇬🇧 +44"]}
                      selected={formData.countryCode || "🇵🇰 +92"}
                      setSelected={(value) => updateFormData('countryCode', value)}
                      variant="form"
                    />
                    {/* <select
                      className="px-3 sm:px-4 py-2 sm:py-3 border-2 border-teal-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition bg-white cursor-pointer hover:border-teal-300 text-sm sm:text-base"
                      defaultValue="+92"
                    >
                      <option value="+92">🇵🇰 +92</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                    </select> */}
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateFormData('phone', e.target.value)}
                      placeholder="3XX-XXXXXXX"
                      required
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 border-teal-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition text-sm sm:text-base"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    placeholder="your.email@example.com"
                    required
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 border-2 border-teal-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition text-sm sm:text-base"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Contact Method
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2">
                  {contactMethods.map(method => {
                    const Icon = method.icon;
                    return (
                      <button
                        type="button"
                        key={method.value}
                        onClick={() => updateFormData('contactMethod', method.value)}
                        className={`py-2 sm:py-3 rounded-lg border-2 text-center font-medium flex flex-col items-center gap-1 sm:gap-2 text-xs sm:text-sm ${formData.contactMethod === method.value ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-gray-200 hover:border-teal-300 hover:bg-teal-50'}`}
                      >
                        <Icon className="text-sm sm:text-base" />
                        <span>{method.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Availability for Viewings
                </label>
                <textarea
                  value={formData.availability}
                  onChange={(e) => updateFormData('availability', e.target.value)}
                  rows="3"
                  placeholder="Let us know when you are available for site visits"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-teal-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition resize-none text-sm sm:text-base"
                ></textarea>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 border border-teal-100">
            <h2 className="text-xl sm:text-2xl font-bold text-teal-900 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
              <FaFile className="text-teal-600 text-lg sm:text-xl" /> Property Documentation
            </h2>

            <div className="space-y-4 sm:space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-teal-800 mb-3 sm:mb-4">Upload Property Documents</h3>
                <p className="text-gray-600 mb-3 sm:mb-4 flex items-start sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                  <FaInfoCircle className="text-teal-500 text-sm sm:text-base mt-0.5 sm:mt-0" />
                  Verified properties with documents get <strong>3x more inquiries</strong> and sell faster.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                  {/* Title Deed */}
                  <div className="border-2 border-dashed border-teal-200 rounded-xl p-3 sm:p-4 md:p-6 hover:border-teal-300 transition">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-teal-100 rounded-full flex items-center justify-center mb-2 sm:mb-3 md:mb-4">
                        <FaFile className="text-teal-600 text-lg sm:text-xl md:text-2xl" />
                      </div>
                      <h4 className="font-bold text-teal-900 mb-1 sm:mb-2 text-sm sm:text-base md:text-lg">Title Deed / Registry</h4>
                      <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 md:mb-4">Proof of ownership document</p>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => updateFormData('titleDeed', e.target.files[0])}
                          className="hidden"
                        />
                        <span className="px-3 sm:px-4 py-1 sm:py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition text-xs sm:text-sm">
                          {formData.titleDeed ? 'Change File' : 'Upload File'}
                        </span>
                      </label>
                      {formData.titleDeed && (
                        <p className="text-green-600 text-xs sm:text-sm mt-1 sm:mt-2 flex items-center gap-1">
                          <FaCheck /> Uploaded
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Property Tax Receipt */}
                  <div className="border-2 border-dashed border-teal-200 rounded-xl p-3 sm:p-4 md:p-6 hover:border-teal-300 transition">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-teal-100 rounded-full flex items-center justify-center mb-2 sm:mb-3 md:mb-4">
                        <FaFileInvoice className="text-teal-600 text-lg sm:text-xl md:text-2xl" />
                      </div>
                      <h4 className="font-bold text-teal-900 mb-1 sm:mb-2 text-sm sm:text-base md:text-lg">Property Tax Receipt</h4>
                      <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 md:mb-4">Latest tax payment proof</p>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => updateFormData('taxReceipt', e.target.files[0])}
                          className="hidden"
                        />
                        <span className="px-3 sm:px-4 py-1 sm:py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition text-xs sm:text-sm">
                          {formData.taxReceipt ? 'Change File' : 'Upload File'}
                        </span>
                      </label>
                      {formData.taxReceipt && (
                        <p className="text-green-600 text-xs sm:text-sm mt-1 sm:mt-2 flex items-center gap-1">
                          <FaCheck /> Uploaded
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Utility Bill */}
                  <div className="border-2 border-dashed border-teal-200 rounded-xl p-3 sm:p-4 md:p-6 hover:border-teal-300 transition">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-teal-100 rounded-full flex items-center justify-center mb-2 sm:mb-3 md:mb-4">
                        <FaFileInvoiceDollar className="text-teal-600 text-lg sm:text-xl md:text-2xl" />
                      </div>
                      <h4 className="font-bold text-teal-900 mb-1 sm:mb-2 text-sm sm:text-base md:text-lg">Utility Bill</h4>
                      <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 md:mb-4">Electricity/Gas bill for address verification</p>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => updateFormData('utilityBill', e.target.files[0])}
                          className="hidden"
                        />
                        <span className="px-3 sm:px-4 py-1 sm:py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition text-xs sm:text-sm">
                          {formData.utilityBill ? 'Change File' : 'Upload File'}
                        </span>
                      </label>
                      {formData.utilityBill && (
                        <p className="text-green-600 text-xs sm:text-sm mt-1 sm:mt-2 flex items-center gap-1">
                          <FaCheck /> Uploaded
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ID Card Copy */}
                  <div className="border-2 border-dashed border-teal-200 rounded-xl p-3 sm:p-4 md:p-6 hover:border-teal-300 transition">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-teal-100 rounded-full flex items-center justify-center mb-2 sm:mb-3 md:mb-4">
                        <FaIdCard className="text-teal-600 text-lg sm:text-xl md:text-2xl" />
                      </div>
                      <h4 className="font-bold text-teal-900 mb-1 sm:mb-2 text-sm sm:text-base md:text-lg">Owner's ID Card</h4>
                      <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 md:mb-4">CNIC/NICOP copy for verification</p>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => updateFormData('idCard', e.target.files[0])}
                          className="hidden"
                        />
                        <span className="px-3 sm:px-4 py-1 sm:py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition text-xs sm:text-sm">
                          {formData.idCard ? 'Change File' : 'Upload File'}
                        </span>
                      </label>
                      {formData.idCard && (
                        <p className="text-green-600 text-xs sm:text-sm mt-1 sm:mt-2 flex items-center gap-1">
                          <FaCheck /> Uploaded
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={formData.documentNotes}
                  onChange={(e) => updateFormData('documentNotes', e.target.value)}
                  rows="3"
                  placeholder="Any additional information about the documents or special circumstances..."
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-teal-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition resize-none text-sm sm:text-base"
                ></textarea>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <form ref={formRef} onSubmit={submitForm} id="sell-form-section">
      {renderStep()}

      {/* Form Navigation */}
      <div className="flex flex-col sm:flex-row justify-between pt-6 sm:pt-8 border-t border-teal-100 gap-3 sm:gap-0">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={prevStep}
            className="px-4 sm:px-6 md:px-8 py-2 sm:py-3 border-2 border-teal-600 text-teal-600 font-semibold rounded-lg hover:bg-teal-50 transition-colors flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base order-2 sm:order-1"
          >
            <FaArrowLeft className="text-sm sm:text-base" /> Previous
          </button>
        ) : (
          <div className="order-2 sm:order-1"></div>
        )}

        {currentStep < 7 ? (
          <button
            type="button"
            onClick={async () => {
              // client-side validation before moving to next step
              const validateStep = (step) => {
                switch (step) {
                  case 1:
                    return { ok: true };
                  case 2:
                    if (!formData.city || !formData.area || !formData.address) return { ok: false, message: 'Please complete City, Area and Address before continuing.' };
                    return { ok: true };
                  case 3:
                    if (!formData.size) return { ok: false, message: 'Please enter the property size before continuing.' };
                    return { ok: true };
                  case 4:
                    if (!formData.price || !formData.propertyName || !formData.description) {
                      const priceLabel = String(formData.listingType || 'sale') === 'rent' ? 'Monthly Rent' : 'Asking Price';
                      return { ok: false, message: `Please fill ${priceLabel}, Title and Description before continuing.` };
                    }
                    return { ok: true };
                  case 5:
                    if (!formData.photos || formData.photos.length === 0) return { ok: false, message: 'Please upload at least one property photo before continuing.' };
                    return { ok: true };
                  case 6:
                    if (!formData.ownerName || !formData.phone || !formData.email) return { ok: false, message: 'Please provide your name, phone number and email before continuing.' };
                    return { ok: true };
                  default:
                    return { ok: true };
                }
              };

              const result = validateStep(currentStep);
              if (result.ok) {
                nextStep();
              } else {
                alert(result.message);
                // scroll form into view and focus first input
                const el = formRef.current;
                if (el) {
                  const header = document.querySelector('header');
                  const headerHeight = header && header.offsetHeight ? header.offsetHeight : 0;
                  const top = el.getBoundingClientRect().top + window.scrollY - headerHeight - 12;
                  try { window.scrollTo({ top: Math.max(0, top), left: 0, behavior: 'smooth' }); } catch(_e) { window.scrollTo(0, Math.max(0, top)); }
                  const first = el.querySelector('input, textarea, select, button');
                  if (first && typeof first.focus === 'function') first.focus();
                }
              }
            }}
            className="px-4 sm:px-6 md:px-8 py-2 sm:py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base order-1 sm:order-2"
          >
            Next <FaArrowRight className="text-sm sm:text-base" />
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 order-1 sm:order-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={saveDraft}
              className="px-4 sm:px-6 md:px-8 py-2 sm:py-3 border-2 border-teal-600 text-teal-600 font-semibold rounded-lg hover:bg-teal-50 transition-colors flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
            >
              <FaSave className="text-sm sm:text-base" /> Save Draft
            </button>
            <button
              type="submit"
              className="px-4 sm:px-6 md:px-8 py-2 sm:py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
            >
              <FaPaperPlane className="text-sm sm:text-base" /> Submit Listing
            </button>
          </div>
        )}
      </div>
    </form>
  );
};

export default SellForm;

