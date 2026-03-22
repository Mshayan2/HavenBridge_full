import React from 'react';
import { FaEdit, FaCheckCircle, FaUsers, FaFileContract } from 'react-icons/fa';

const HowItWorks = () => {
  const steps = [
    {
      icon: <FaEdit />,
      number: 1,
      title: 'List Property',
      description: 'Fill details, upload photos, set price'
    },
    {
      icon: <FaCheckCircle />,
      number: 2,
      title: 'Get Verified',
      description: 'Documentation & property verification'
    },
    {
      icon: <FaUsers />,
      number: 3,
      title: 'Connect Buyers',
      description: 'Receive inquiries & schedule viewings'
    },
    {
      icon: <FaFileContract />,
      number: 4,
      title: 'Close Deal',
      description: 'Legal docs & secure payment transfer'
    }
  ];

  return (
    <section className="py-6 sm:py-12 md:py-16 bg-linear-to-b from-white to-teal-50">
      <div className="container mx-auto px-3 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-10 md:mb-12">
          <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-teal-900 mb-2 sm:mb-4">
            Sell in 4 Simple Steps
          </h2>
          <p className="text-gray-600 text-xs sm:text-base max-w-4xl mx-auto px-2 sm:px-0">
            Our streamlined process makes selling your property fast and stress-free
          </p>
        </div>
        
        {/* Horizontal scroll container for mobile */}
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 overflow-x-auto pb-4 sm:pb-0 scrollbar-hide">
          {steps.map((step) => (
            <div 
              key={step.number} 
              className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-lg border border-teal-200 hover:shadow-xl transition-all duration-300 group shrink-0 w-70 sm:w-auto sm:shrink"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-linear-to-r from-teal-600 to-teal-400 text-white rounded-full flex items-center justify-center font-bold text-lg sm:text-xl mb-3 sm:mb-4 mx-auto group-hover:scale-110 transition-transform">
                {step.icon}
              </div>
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold mb-2 sm:mb-3 mx-auto">
                {step.number}
              </div>
              <h3 className="text-base sm:text-xl font-bold text-teal-900 mb-2 sm:mb-3 text-center">
                {step.title}
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm text-center leading-tight sm:leading-relaxed">
                {step.description}
              </p>
              <div className="w-10 sm:w-12 h-1 bg-linear-to-r from-teal-400 to-teal-300 rounded-full mx-auto mt-3 sm:mt-4"></div>
            </div>
          ))}
        </div>

        {/* Mobile scroll indicator */}
        <div className="sm:hidden text-center mt-2">
          <div className="inline-flex items-center gap-1 text-teal-600 text-xs">
            <span className="animate-pulse">←</span>
            <span>Swipe to see more</span>
            <span className="animate-pulse">→</span>
          </div>
        </div>

        <div className="mt-6 sm:mt-10 md:mt-12 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-1 sm:gap-2 bg-teal-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
            <span className="text-teal-600 font-semibold text-xs sm:text-base">
              Average time to sell:
            </span>
            <span className="bg-orange-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold">
              30-45 Days
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
