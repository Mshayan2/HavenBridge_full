// TestimonialsSection.jsx
import React from 'react';
import { FaStar, FaQuoteLeft, FaCheckCircle } from 'react-icons/fa';

const TestimonialsSection = () => {
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
      name: 'Farhan Tariq',
      location: 'Karachi',
      property: '10 Marla Commercial Plot',
      price: 'PKR 3.5 Crore',
      time: '6 weeks',
      quote: 'No commission fees saved me over PKR 500,000. The smart pricing tool was spot on!',
      rating: 5
    }
  ];

  const stats = [
    { value: '97%', label: 'Seller Satisfaction' },
    { value: '28 days', label: 'Avg. Time to Sell' },
    { value: '10,000+', label: 'Properties Sold' },
    { value: 'PKR 0', label: 'Commission Fees' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-teal-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
          <FaQuoteLeft className="text-orange-600 text-lg" />
        </div>
        <h3 className="text-2xl font-bold text-teal-900">Seller Success Stories</h3>
      </div>
      
      <div className="space-y-6 mb-8">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="border-l-4 border-teal-500 pl-4 py-3 bg-teal-50/50 rounded-r-lg">
            <div className="flex items-center gap-2 mb-2">
              {[...Array(testimonial.rating)].map((_, i) => (
                <FaStar key={i} className="text-orange-500 text-sm" />
              ))}
            </div>
            <p className="text-gray-700 italic mb-3">"{testimonial.quote}"</p>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div>
                <p className="font-semibold text-teal-700">{testimonial.name}, {testimonial.location}</p>
                <p className="text-gray-600 text-sm">{testimonial.property}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-teal-800">{testimonial.price}</p>
                <p className="text-gray-500 text-xs">Sold in {testimonial.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-linear-to-br from-teal-50 to-white p-4 rounded-lg border border-teal-200 text-center">
            <div className="text-2xl font-bold text-teal-700 mb-1">{stat.value}</div>
            <div className="text-xs text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-600">
        <FaCheckCircle className="text-green-500" />
        <span>Trusted by 10,000+ sellers across Pakistan</span>
      </div>
    </div>
  );
};

export default TestimonialsSection;