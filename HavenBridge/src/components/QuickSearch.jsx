import React, { useState } from 'react';
import { FaSearch, FaHome } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import CustomDropdown from './CustomDropdown';

const QuickSearch = () => {
  const navigate = useNavigate();
  
  const [type, setType] = useState('Property Type');
  const [beds, setBeds] = useState('Bedrooms');
  const [baths, setBaths] = useState('Bathrooms');
  const [price, setPrice] = useState('Price Range');
  
  const handleQuickSearch = () => {
    const searchParams = new URLSearchParams();
    
    if (type !== 'Property Type') searchParams.set('type', type.toLowerCase());
    if (beds !== 'Bedrooms') searchParams.set('beds', beds.replace('+', ''));
    if (baths !== 'Bathrooms') searchParams.set('baths', baths.replace('+', ''));

    if (price !== 'Price Range') {
      let priceValue = '';
      switch (price) {
        case 'PKR 10 Lac - 50 Lac':
          priceValue = '1000000-5000000';
          break;
        case 'PKR 50 Lac - 1 Crore':
          priceValue = '5000000-10000000';
          break;
        case 'PKR 1 Crore - 2 Crore':
          priceValue = '10000000-20000000';
          break;
        case 'PKR 2 Crore+':
          priceValue = '20000000+';
          break;
        default:
          priceValue = price;
      }
      searchParams.set('price', priceValue);
    }

    // Navigate to Properties page with query params
    navigate(`/properties?${searchParams.toString()}`);
  };

  const typeOptions = ['Property Type', 'House', 'Apartment', 'Villa', 'Plot', 'Commercial'];
  const bedOptions = ['Bedrooms', '1', '2', '3', '4+'];
  const bathOptions = ['Bathrooms', '1', '2', '3', '4+'];
  const priceOptions = [
    'Price Range',
    'PKR 10 Lac - 50 Lac',
    'PKR 50 Lac - 1 Crore',
    'PKR 1 Crore - 2 Crore',
    'PKR 2 Crore+'
  ];

  return (
    <section className="bg-white py-10 -mt-4 rounded-t-3xl relative z-20 shadow-lg">
      <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-teal-900 mb-2">Find Similar Properties</h2>
            <p className="text-gray-600">Compare your property with others in the market</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <CustomDropdown options={typeOptions} selected={type} setSelected={setType} />
            <CustomDropdown options={bedOptions} selected={beds} setSelected={setBeds} />
            <CustomDropdown options={bathOptions} selected={baths} setSelected={setBaths} />
            <CustomDropdown options={priceOptions} selected={price} setSelected={setPrice} />
          </div>
          
          <button 
            onClick={handleQuickSearch}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 rounded-lg flex items-center justify-center gap-2 text-lg transition-colors shadow-md hover:shadow-lg"
          >
            <FaSearch /> FIND SIMILAR PROPERTIES
          </button>
          
          <p className="text-center text-gray-500 text-sm mt-4">
            <FaHome className="inline mr-2" />
            See how your property compares to similar listings
          </p>
        </div>
    </section>
  );
};

export default QuickSearch;
