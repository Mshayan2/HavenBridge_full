

import React from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaStar } from 'react-icons/fa';
import { mortgageBrokers } from '../data/constants';

const MortgageBrokers = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-teal-900 mb-4">Local Mortgage Brokers</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Need help with a mortgage? Compare your finance options with trusted local experts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {mortgageBrokers.map((broker) => (
            <div key={broker.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              {/* Broker Image and Basic Info */}
              {/* Broker Image and Basic Info */}
<div className="flex items-start gap-4 mb-6">
  {/* Broker Image */}
  <div className="w-20 h-20 rounded-full overflow-hidden shrink-0 border-2 border-gray-100">
    <img
      src={broker.image}
      alt={broker.name}
      className="w-full h-full object-cover"
    />
  </div>

  <div className="flex-1">
    {/* Name, Company and Star/Reviews row */}
    <div className="flex items-start justify-between mb-2">
      <div>
        <h3 className="text-xl font-bold text-gray-900">{broker.name}</h3>
        <p className="text-teal-600 font-medium">{broker.company}</p>
      </div>
      <div className="flex items-center gap-1">
        <FaStar className="text-yellow-400 text-sm" />
        <span className="text-gray-600 text-sm">{broker.reviews}</span>
      </div>
    </div>
    
    {/* Location row */}
    <div className="flex items-center gap-2">
      <FaMapMarkerAlt className="text-gray-400 text-sm" />
      <span className="text-gray-600 text-sm">{broker.location}</span>
    </div>
  </div>
</div>
 <div className="mb-8">
                <h4 className="font-bold text-gray-900 mb-4 text-lg">Specialties:</h4>
                <div className="flex flex-wrap gap-2">
                  {broker.specialties.map((specialty, index) => (
                    <span key={index} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <FaPhone className="text-gray-400" />
                  <span className="text-gray-700">{broker.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaEnvelope className="text-gray-400" />
                  <a href={`mailto:${broker.email}`} className="text-gray-700 hover:text-teal-600">
                    {broker.email}
                  </a>
                </div>
              </div>

              {/* Contact Broker Button - CHANGED TO ORANGE */}
              <button className="w-full py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors">
                Contact Broker
              </button>
            </div>
          ))}
        </div>

        {/* View All Brokers Button - ALSO CHANGED TO ORANGE */}
        <div className="text-center mt-12">
          {/* <button className="px-8 py-3 border-2 border-orange-500 text-orange-500 font-semibold rounded-lg hover:bg-orange-50 transition-colors"> */}
          <button className="px-8 py-3 border-2 border-orange-500 text-orange-500 font-semibold rounded-lg hover:bg-orange-500 hover:text-white transition-colors duration-300 hover:shadow-md">
            View All Brokers
          </button>
        </div>
      </div>
    </section>
  );
};

export default MortgageBrokers;
