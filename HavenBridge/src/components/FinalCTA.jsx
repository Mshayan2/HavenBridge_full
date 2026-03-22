import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRocket, FaDownload, FaCheckCircle, FaShieldAlt, FaClock } from 'react-icons/fa';

const FinalCTA = () => {
  const navigate = useNavigate();
  return (
    <section className="py-20 bg-linear-to-r from-teal-600 to-teal-500 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '100px 100px'
        }}></div>
      </div>

      <div className="text-center relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Sell Your Property?</h2>
        <p className="text-xl text-teal-100 max-w-2xl mx-auto mb-8">
          Join thousands of satisfied sellers who've sold their properties faster and at better prices with HomeBridge
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          {/* <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-8 py-4 bg-white text-teal-600 hover:bg-teal-50 rounded-lg font-bold text-lg shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <FaRocket /> START SELLING NOW
          </button> */}
          
    <button
      onClick={() => navigate('/sell', { state: { fromHeader: true } })}
      className="px-8 py-4 bg-white text-teal-600 hover:bg-teal-50 rounded-lg font-bold text-lg shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
    >
      <FaRocket /> START SELLING NOW
    </button>

          <button className="px-8 py-4 border-2 border-white text-white hover:bg-white/10 rounded-lg font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2">
            <FaDownload /> Download Seller's Guide
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
              <FaCheckCircle className="text-white text-xl" />
            </div>
            <span className="text-teal-100 text-sm">No hidden fees</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
              <FaShieldAlt className="text-white text-xl" />
            </div>
            <span className="text-teal-100 text-sm">Secure transactions</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
              <FaClock className="text-white text-xl" />
            </div>
            <span className="text-teal-100 text-sm">24/7 support</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
              {/* <div className="w-12 h-12 bg-orange-500/30 rounded-full flex items-center justify-center mb-2"> */}
              <FaRocket className="text-white text-xl" />
            </div>
            <span className="text-teal-100 text-sm">Fast results</span>
          </div>
        </div>

        {/* <p className="text-teal-200 text-sm mt-10">✅ No hidden fees • ✅ 24/7 Support • ✅ Secure Transactions</p> */}
      </div>
    </section>
  );
};

export default FinalCTA;