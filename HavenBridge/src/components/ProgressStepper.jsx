import React from 'react';
import { FaHome, FaMapMarkerAlt, FaRulerCombined, FaDollarSign, FaTag, FaPhone, FaFile } from 'react-icons/fa';

const ProgressStepper = ({ currentStep }) => {
  const steps = [
    { number: 1, title: 'Property Basics', icon: FaHome, description: 'Type & Purpose' },
    { number: 2, title: 'Location', icon: FaMapMarkerAlt, description: 'Address & Area' },
    { number: 3, title: 'Details', icon: FaRulerCombined, description: 'Size & Rooms' },
    { number: 4, title: 'Pricing', icon: FaDollarSign, description: 'Price & Description' },
    { number: 5, title: 'Features', icon: FaTag, description: 'Photos & Amenities' },
    { number: 6, title: 'Contact', icon: FaPhone, description: 'Your Information' },
    { number: 7, title: 'Documents', icon: FaFile, description: 'Upload Documents' }
  ];

  const currentStepData = steps[currentStep - 1];

  return (
    <div className="mb-8 sm:mb-10 md:mb-12">
      {/* Desktop Stepper - Full horizontal view */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          {steps.map((stepItem, index) => (
            <React.Fragment key={stepItem.number}>
              <div className="flex flex-col items-center z-10">
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex flex-col items-center justify-center font-bold ${currentStep > stepItem.number ? 'bg-green-500' : currentStep === stepItem.number ? 'bg-teal-600' : 'bg-teal-200'} ${currentStep === stepItem.number ? 'ring-4 ring-teal-100' : ''} transition-all`}>
                  <stepItem.icon className={`text-base md:text-lg ${currentStep >= stepItem.number ? 'text-white' : 'text-teal-600'}`} />
                  <span className={`text-xs mt-1 ${currentStep >= stepItem.number ? 'text-white' : 'text-teal-600'}`}>
                    Step {stepItem.number}
                  </span>
                </div>
                <span className={`mt-2 font-semibold text-xs md:text-sm text-center ${currentStep >= stepItem.number ? 'text-teal-700' : 'text-gray-500'} max-w-[100px]`}>
                  {stepItem.title}
                </span>
                <span className={`mt-1 text-xs text-gray-500 text-center max-w-[100px] hidden lg:block`}>
                  {stepItem.description}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-1 flex-1 ${currentStep > stepItem.number ? 'bg-green-500' : 'bg-teal-200'} mx-2 md:mx-4`}></div>
              )}
            </React.Fragment>
          ))}
        </div>
        
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-teal-50 px-4 py-2 rounded-lg">
            <span className="text-teal-600 font-medium">Current Step:</span>
            <span className="bg-teal-600 text-white px-3 py-1 rounded-md text-sm font-semibold">
              {currentStepData?.title}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile/Tab Stepper - Simplified view */}
      <div className="md:hidden">
        {/* Current Step Indicator (Mobile) */}
        <div className="mb-4 bg-teal-50 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold ${currentStepData ? 'bg-teal-600' : 'bg-teal-200'} ring-4 ring-teal-100`}>
                {currentStepData?.icon && (
                  <currentStepData.icon className="text-white text-lg sm:text-xl" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-teal-600 font-medium text-sm sm:text-base">Step {currentStep} of {steps.length}</span>
                  <span className="bg-teal-600 text-white text-xs px-2 py-0.5 rounded-full">Current</span>
                </div>
                <h3 className="font-semibold text-gray-800 text-base sm:text-lg mt-0.5">
                  {currentStepData?.title}
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm mt-0.5">
                  {currentStepData?.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar for Mobile */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span>{Math.round((currentStep / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-teal-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Navigation Dots (Mobile) */}
        <div className="flex justify-center gap-1.5 mb-2">
          {steps.map((stepItem) => (
            <div
              key={stepItem.number}
              className={`w-2 h-2 rounded-full ${currentStep === stepItem.number ? 'bg-teal-600' : currentStep > stepItem.number ? 'bg-green-500' : 'bg-gray-300'}`}
              title={`Step ${stepItem.number}: ${stepItem.title}`}
            ></div>
          ))}
        </div>
        <p className="text-center text-xs text-gray-500">
          Tap dots to see step {currentStep} of {steps.length}
        </p>
      </div>
    </div>
  );
};

export default ProgressStepper;
