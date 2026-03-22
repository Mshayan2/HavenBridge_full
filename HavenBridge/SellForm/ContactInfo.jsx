import React, { useState } from 'react';

const ContactInfo = ({ formData, handleChange, nextStep, prevStep, loading, error }) => {
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!formData.contactName) errors.contactName = 'Name is required';
    if (!formData.contactEmail) errors.contactEmail = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) errors.contactEmail = 'Invalid email';
    if (!formData.contactPhone) errors.contactPhone = 'Phone is required';
    else if (!/^\d{10,15}$/.test(formData.contactPhone)) errors.contactPhone = 'Invalid phone number';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validate()) nextStep();
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-teal-900">Contact Information</h3>
      
      <div className="grid gap-4">
        <div>
          <label className="font-semibold">Name</label>
          <input
            type="text"
            value={formData.contactName}
            onChange={e => handleChange('contactName', e.target.value)}
            className="w-full border p-2 rounded-lg"
          />
          {fieldErrors.contactName && <p className="text-red-500 text-sm">{fieldErrors.contactName}</p>}
        </div>

        <div>
          <label className="font-semibold">Email</label>
          <input
            type="email"
            value={formData.contactEmail}
            onChange={e => handleChange('contactEmail', e.target.value)}
            className="w-full border p-2 rounded-lg"
          />
          {fieldErrors.contactEmail && <p className="text-red-500 text-sm">{fieldErrors.contactEmail}</p>}
        </div>

        <div>
          <label className="font-semibold">Phone</label>
          <input
            type="tel"
            value={formData.contactPhone}
            onChange={e => handleChange('contactPhone', e.target.value)}
            className="w-full border p-2 rounded-lg"
          />
          {fieldErrors.contactPhone && <p className="text-red-500 text-sm">{fieldErrors.contactPhone}</p>}
        </div>
      </div>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      <div className="flex justify-between mt-6">
        <button onClick={prevStep} className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">Previous</button>
        <button
          onClick={handleNext}
          disabled={loading}
          className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </div>
  );
};

export default ContactInfo;
