

import React, { useState } from 'react';
import { FaQuestionCircle, FaCommentDots, FaPhone, FaQuoteLeft, FaStar, FaCheckCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const SellerSupportCards = () => {
  const testimonials = [
    {
      name: 'Ahmed Raza',
      location: 'Lahore',
      property: '5 Marla House in DHA',
      price: 'PKR 1.8 Crore',
      time: '3 weeks',
      quote: 'Sold within 3 weeks for PKR 1.8 Crore. HomeBridge made the process incredibly smooth!',
      rating: 5
    },
    {
      name: 'Sara Khan',
      location: 'Islamabad',
      property: '8 Marla Villa',
      price: 'PKR 2.3 Crore',
      time: '4 weeks',
      quote: 'As a first-time seller, I was nervous. The team guided me through every step. Got 12% above asking price!',
      rating: 5
    },
    {
      name: 'Ali Hassan',
      location: 'Karachi',
      property: '10 Marla Commercial Plot',
      price: 'PKR 4.5 Crore',
      time: '6 weeks',
      quote: 'Professional service from start to finish. The marketing was excellent and attracted serious buyers.',
      rating: 5
    },
    {
      name: 'Fatima Ahmed',
      location: 'Rawalpindi',
      property: '3 Marla Apartment',
      price: 'PKR 85 Lakh',
      time: '2 weeks',
      quote: 'Quick sale at a great price. The team was responsive and handled everything professionally.',
      rating: 5
    }
  ];

  const [showAll, setShowAll] = useState(false);
  const testimonialsToShow = showAll ? testimonials : testimonials.slice(0, 2);

  return (
    <div className="space-y-8">
      {/* Testimonials Card with Fixed Height */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-teal-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <FaQuoteLeft className="text-orange-600 text-lg" />
          </div>
          <h3 className="text-xl font-bold text-teal-900">Seller Success Stories</h3>
        </div>
        
        {/* Fixed Height Container with Scroll */}
        <div 
          className="space-y-6 mb-6 overflow-y-auto"
          style={{ 
            maxHeight: "243px",
            minHeight: "200px"
          }}
        >
          {testimonialsToShow.map((testimonial, index) => (
            <div 
              key={index} 
              className="border-l-4 border-teal-500 pl-4 py-3 bg-teal-50/50 rounded-r-lg"
              style={{ minHeight: "110px" }} // Minimum height for each testimonial
            >
              <div className="flex items-center gap-2 mb-2">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <FaStar key={i} className="text-orange-500 text-sm" />
                ))}
              </div>
              <p className="text-gray-700 italic text-sm mb-3">"{testimonial.quote}"</p>
              {/* <p className="text-gray-700 italic text-sm mb-3 line-clamp-2">"{testimonial.quote}"</p> */}
              <div className="flex flex-col">
                <div className="mb-1">
                  <p className="font-semibold text-teal-700 text-sm">{testimonial.name}, {testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Toggle Button for More/Less */}
        {testimonials.length > 2 && (
          <div className="flex justify-center mb-4">
            <button
              onClick={() => setShowAll(!showAll)}
              className="flex items-center gap-2 text-teal-600 hover:text-teal-800 font-medium text-sm transition-colors"
            >
              {showAll ? (
                <>
                  Show Less <FaChevronUp className="text-xs" />
                </>
              ) : (
                <>
                  Show More Stories <FaChevronDown className="text-xs" />
                </>
              )}
            </button>
          </div>
        )}
        
        {/* Trust Badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-600 border-t pt-4 mt-2">
          <FaCheckCircle className="text-green-500" />
          <span>Trusted by 10,000+ sellers across Pakistan</span>
        </div>
      </div>
      
      {/* Help Card - Keep as is */}
      <div className="bg-white rounded-xl shadow-lg p-4 border border-teal-100">
        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <FaQuestionCircle className="text-orange-500 text-xl" />
        </div>
        <h3 className="text-lg font-bold text-teal-900 mb-2 text-center">Need Assistance?</h3>
        <p className="text-gray-600 mb-3 text-center text-xs">Our expert team is here to help you 24/7</p>
        <div className="space-y-2">
          <button className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm">
            <FaCommentDots /> Live Chat Support
          </button>
          <button className="w-full py-2 border-2 border-teal-600 text-teal-600 font-semibold rounded-lg hover:bg-teal-50 transition-colors flex items-center justify-center gap-2 text-sm">
            <FaPhone /> Schedule Callback
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerSupportCards;
