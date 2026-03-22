import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { submitProperty } from '../api/properties';
import SellHero from '../components/SellHero';
import QuickSearch from '../components/QuickSearch';
import HowItWorks from '../components/HowItWorks';
import ProgressStepper from '../components/ProgressStepper';
import SellForm from '../components/SellForm';
import PreviewSidebar from '../components/PreviewSidebar';
import BenefitsSection from '../components/BenefitsSection';
import FinalCTA from '../components/FinalCTA';
import SellerSupportCards from '../components/SellerSupportCards';
import FAQSection from '../components/FAQ';

// Small local helper: scroll to top on initial mount
const ScrollToTopOnMount = () => {
  const location = useLocation();
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      if (history && history.replaceState) {
        try { 
          history.replaceState(null, document.title, window.location.pathname + window.location.search); 
        } catch(_e) { /* ignore */ }
      }
    } catch (_e) { /* ignore */ }
  }, [location.pathname]);
  return null;
};

const SellProperty = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    listingType: 'sale',
    propertyType: 'House',
    propertySubtype: 'House',
    city: '',
    area: '',
    address: '',
    lat: '',
    lng: '',
    size: '',
    sizeUnit: 'marla',
    bedrooms: '1',
    bathrooms: '1',
    condition: '',
    yearBuilt: '',
    price: '',
    rentalDeposit: '',
    rentalMinTermMonths: '6',
    rentalCurrency: 'pkr',
    propertyName: '',
    description: '',
    features: ['Balcony', 'Parking', 'Security'],
    photos: [],
    newFeature: '',
    ownerName: '',
    phone: '',
    email: '',
    availability: '',
    contactMethod: 'phone',
    titleDeed: null,
    taxReceipt: null,
    utilityBill: null,
    idCard: null,
    documentNotes: ''
  });

  const updateFormData = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const saveDraft = () => {
    const draftData = { ...formData, savedAt: new Date().toISOString() };
    localStorage.setItem('propertyDraft', JSON.stringify(draftData));
    alert('Draft saved successfully!');
  };

  const submitForm = async (e) => {
    e.preventDefault();

    if (!formData.price || !formData.address || !formData.ownerName || !formData.phone) {
      alert('Please fill in all required fields marked with *');
      return;
    }

    const listingType = String(formData.listingType || 'sale').toLowerCase();
    const isRent = listingType === 'rent';

    if (isRent) {
      const term = Number(formData.rentalMinTermMonths);
      if (!Number.isFinite(term) || term < 1) {
        alert('Please select a valid minimum lease term.');
        return;
      }
    }

    // Require title deed document for submission
    if (!formData.titleDeed) {
      alert('Please upload the Title Deed / Registry document before submitting your property.');
      return;
    }

    const latStr = String(formData.lat || '').trim();
    const lngStr = String(formData.lng || '').trim();
    if ((latStr && !lngStr) || (!latStr && lngStr)) {
      alert('Please provide both Latitude and Longitude (or leave both empty).');
      return;
    }
    if (latStr && lngStr) {
      const lat = Number(latStr);
      const lng = Number(lngStr);
      if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
        alert('Latitude must be a number between -90 and 90.');
        return;
      }
      if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
        alert('Longitude must be a number between -180 and 180.');
        return;
      }
    }

    try {
      const payload = {
        title: formData.propertyName || `${formData.propertyType} in ${formData.area}`,
        description: formData.description,
        price: formData.price,
        location: `${formData.city} - ${formData.area}`,
        type: (formData.propertyType || 'house').toLowerCase(),
        area: formData.size,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        features: formData.features,
        listingType,
        ...(isRent ? {
          rentalDeposit: formData.rentalDeposit,
          rentalMinTermMonths: formData.rentalMinTermMonths,
          rentalCurrency: formData.rentalCurrency,
        } : {}),
        ...(latStr && lngStr ? { lat: latStr, lng: lngStr } : {}),
        contactName: formData.ownerName,
        contactPhone: formData.phone,
        contactEmail: formData.email,
        photos: formData.photos,
        titleDeed: formData.titleDeed,
        taxReceipt: formData.taxReceipt,
        utilityBill: formData.utilityBill,
        idCard: formData.idCard,
      };

      await submitProperty(payload);
      try { localStorage.setItem('properties:updated', String(Date.now())); } catch (_e) { /* ignore */ }
      alert('Your property has been submitted successfully! Our team will contact you within 24 hours.');
      navigate('/profile');

      // Reset local form
      setFormData({
        listingType: 'sale',
        propertyType: 'House',
        propertySubtype: 'House',
        city: '',
        area: '',
        address: '',
        lat: '',
        lng: '',
        size: '',
        sizeUnit: 'marla',
        bedrooms: '1',
        bathrooms: '1',
        condition: '',
        yearBuilt: '',
        price: '',
        rentalDeposit: '',
        rentalMinTermMonths: '6',
        rentalCurrency: 'pkr',
        propertyName: '',
        description: '',
        features: ['Balcony', 'Parking', 'Security'],
        photos: [],
        newFeature: '',
        ownerName: '',
        phone: '',
        email: '',
        availability: '',
        contactMethod: 'phone',
        titleDeed: null,
        taxReceipt: null,
        utilityBill: null,
        idCard: null,
        documentNotes: ''
      });
      setCurrentStep(1);
    } catch (err) {
      console.error('Submit property error:', err);
      alert((err && err.message) || 'Failed to submit property');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/50 to-white">
      {/* Ensure page opens at top when navigated to */}
      <ScrollToTopOnMount />
      
      {/* Hero Section */}
      <SellHero />
      
      {/* Quick Search */}
      <QuickSearch />
      
      {/* How It Works */}
      <HowItWorks />

      {/* Main Form Section */}
      <section className="py-16 bg-white relative overflow-hidden">
        {/* Subtle Background Decoration */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-50 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl opacity-50" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-50 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl opacity-50" />
        
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          {/* Progress Stepper */}
          <ProgressStepper currentStep={currentStep} />
          
          {/* Form Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <SellForm 
                  currentStep={currentStep}
                  formData={formData}
                  updateFormData={updateFormData}
                  nextStep={nextStep}
                  prevStep={prevStep}
                  saveDraft={saveDraft}
                  submitForm={submitForm}
                />
              </div>
            </div>

            {/* Preview Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <PreviewSidebar formData={formData} />
              </div>
            </div>
            
            {/* FAQ Section */}
            <div className="lg:col-span-2">
              <FAQSection />
            </div>
            
            {/* Seller Support Cards */}
            <div className="lg:col-span-1">
              <SellerSupportCards />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <BenefitsSection />
      
      {/* Final CTA */}
      <FinalCTA />
    </div>
  );
};

export default SellProperty;
