import React from 'react';
import { FaMoneyBillWave, FaUsers, FaChartLine, FaShieldAlt, FaFileContract, FaTachometerAlt, FaStar } from 'react-icons/fa';

const BenefitsSection = () => {

  const benefits = [
    { 
      icon: <FaMoneyBillWave />, 
      title: 'No Commission', 
      description: 'List for free and save thousands in agent commissions',
      color: 'from-teal-500 to-teal-300' 
    },
    { 
      icon: <FaUsers />, 
      title: 'Direct Buyer Access', 
      description: 'Connect directly with verified buyers, no middlemen',
      color: 'from-orange-500 to-orange-300'
    },
    { 
      icon: <FaChartLine />, 
      title: 'Smart Pricing', 
      description: 'Get real-time market data to price competitively',
      color: 'from-teal-700 to-teal-500'
    },
    { 
      icon: <FaShieldAlt />, 
      title: 'Secure Transactions', 
      description: 'Bank-level encryption for all transactions',
      color: 'from-orange-500 to-orange-300'
    },
    { 
      icon: <FaFileContract />, 
      title: 'Legal Support', 
      description: 'Full documentation assistance included',
      color: 'from-teal-700 to-teal-500'
    },
    { 
      icon: <FaTachometerAlt />, 
      title: 'Sell 40% Faster', 
      description: 'Our platform reduces average time on market',
      color: 'from-orange-700 to-orange-500'
    }
  ];

  return (
    <section className="py-12 sm:py-16 bg-linear-to-b from-white to-teal-50">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-teal-900 mb-3 sm:mb-4">Why Sell with HomeBridge?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base px-2 sm:px-0">
            Get the best value for your property with our intelligent platform
          </p>
          <div className="inline-flex items-center gap-1 sm:gap-2 mt-3 sm:mt-4 bg-teal-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
            <FaStar className="text-orange-500 text-sm sm:text-base" />
            <span className="text-teal-700 font-semibold text-sm sm:text-base">
              Trusted by 10,000+ successful sellers
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-teal-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2 group">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 shrink-0 bg-linear-to-r ${benefit.color} rounded-full flex items-center justify-center text-white text-lg sm:text-xl group-hover:scale-105 sm:group-hover:scale-110 transition-transform`}>
                  {benefit.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-bold text-teal-900 mb-1 sm:mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm sm:text-base">{benefit.description}</p>
                </div>
              </div>
              <div className={`w-8 sm:w-12 h-1 bg-linear-to-r ${benefit.color} rounded-full mt-3 sm:mt-4`}></div>
            </div>
          ))}
        </div>
    </section>
  );
};

export default BenefitsSection;
