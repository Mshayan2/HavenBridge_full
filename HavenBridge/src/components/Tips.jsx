// TipsSection.jsx
import React from 'react';
import { FaLightbulb, FaCamera, FaEdit, FaDollarSign, FaClock, FaCheckCircle } from 'react-icons/fa';

const TipsSection = () => {
  const tips = [
    {
      icon: FaCamera,
      title: 'High-Quality Photos',
      description: 'Properties with professional photos sell 32% faster. Take photos during daylight.',
      impact: '300% more interest'
    },
    {
      icon: FaEdit,
      title: 'Complete Details',
      description: 'Fill all property fields. Buyers filter based on specific features.',
      impact: '45% more inquiries'
    },
    {
      icon: FaDollarSign,
      title: 'Smart Pricing',
      description: 'Price within 5% of market average. Overpriced properties take 3x longer to sell.',
      impact: 'Faster sale'
    },
    {
      icon: FaClock,
      title: 'Quick Responses',
      description: 'Respond to inquiries within 2 hours to maintain buyer interest.',
      impact: '70% higher success'
    }
  ];

  const quickActions = [
    { text: 'Get free property valuation', action: 'valuation' },
    { text: 'Download seller checklist', action: 'checklist' },
    { text: 'Schedule expert consultation', action: 'consultation' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-teal-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
          <FaLightbulb className="text-yellow-600 text-lg" />
        </div>
        <h3 className="text-2xl font-bold text-teal-900">Pro Tips for Faster Sale</h3>
      </div>
      
      <div className="space-y-4 mb-8">
        {tips.map((tip, index) => (
          <div key={index} className="flex items-start gap-4 p-4 border border-teal-100 rounded-lg hover:bg-teal-50 transition-colors">
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center shrink-0">
              <tip.icon className="text-teal-600 text-xl" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-semibold text-teal-800">{tip.title}</h4>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                  {tip.impact}
                </span>
              </div>
              <p className="text-gray-600 text-sm">{tip.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-linear-to-r from-teal-50 to-blue-50 rounded-lg p-4 border border-teal-200 mb-6">
        <h4 className="font-semibold text-teal-800 mb-3">Quick Actions</h4>
        <div className="space-y-2">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className="w-full flex items-center justify-between p-3 bg-white hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors"
            >
              <span className="text-teal-700 font-medium">{action.text}</span>
              <FaCheckCircle className="text-teal-600" />
            </button>
          ))}
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-gray-600 text-sm mb-3">
          <span className="font-semibold text-teal-700">Remember:</span> Complete listings with photos sell fastest
        </p>
        <button className="w-full py-3 bg-linear-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg">
          Get Free Professional Photo Session
        </button>
      </div>
    </div>
  );
};

export default TipsSection;