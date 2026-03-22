import React, { useState } from 'react';
import PropertyBasics from './PropertyBasics';
import LocationDetails from './LocationDetails';
import PropertySpecs from './PropertySpecs';
import PricingDescription from './PricingDescription';
import FeaturesPhotos from './FeaturesPhotos';
import PropertyDocs from './PropertyDocs';
import ContactInfo from './ContactInfo';
import SuccessScreen from './SuccessScreen';
import { submitProperty } from '../../api/properties'; // your API function

const SellForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    location: '',
    address: '',
    city: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    price: '',
    description: '',
    features: [],
    photos: [],
    documents: [],
    contactName: '',
    contactEmail: '',
    contactPhone: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleArrayChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleFileChange = (field, files) => {
    setFormData({ ...formData, [field]: files });
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      // Call API to submit property
      await submitProperty(formData);
      nextStep(); // Show success screen
    } catch (err) {
      setError('Failed to submit property. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleListAnother = () => {
    setFormData({
      title: '',
      type: '',
      location: '',
      address: '',
      city: '',
      bedrooms: '',
      bathrooms: '',
      area: '',
      price: '',
      description: '',
      features: [],
      photos: [],
      documents: [],
      contactName: '',
      contactEmail: '',
      contactPhone: ''
    });
    setStep(1);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      {step === 1 && <PropertyBasics formData={formData} handleChange={handleChange} nextStep={nextStep} />}
      {step === 2 && <LocationDetails formData={formData} handleChange={handleChange} nextStep={nextStep} prevStep={prevStep} />}
      {step === 3 && <PropertySpecs formData={formData} handleChange={handleChange} nextStep={nextStep} prevStep={prevStep} />}
      {step === 4.1 && <PricingDescription formData={formData} handleChange={handleChange} nextStep={nextStep} prevStep={prevStep} />}
      {step === 4.2 && <FeaturesPhotos formData={formData} handleArrayChange={handleArrayChange} handleFileChange={handleFileChange} nextStep={nextStep} prevStep={prevStep} />}
      {step === 4.3 && <PropertyDocs formData={formData} handleFileChange={handleFileChange} nextStep={nextStep} prevStep={prevStep} />}
      {step === 4.4 && <ContactInfo formData={formData} handleChange={handleChange} nextStep={handleSubmit} prevStep={prevStep} loading={loading} error={error} />}
      {step === 5 && <SuccessScreen onListAnother={handleListAnother} />}
    </div>
  );
};

export default SellForm;
