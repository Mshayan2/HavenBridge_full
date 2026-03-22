import React from 'react';
import { Link } from 'react-router-dom';
import news2 from '../assets/news2.jfif';
import { 
  FaHome, FaCheckCircle, FaMoneyBillWave, FaSearch, FaFileContract,
  FaArrowLeft, FaLightbulb, FaCalendarAlt, FaTag
} from 'react-icons/fa';

const FirstTimeBuyersGuide = () => {
  const steps = [
    {
      icon: FaMoneyBillWave,
      title: "Check Your Finances",
      description: "Review your credit score, organise savings, and determine your realistic budget for the purchase."
    },
    {
      icon: FaFileContract,
      title: "Get Pre-Approved",
      description: "Obtain mortgage pre-approval to understand your borrowing power and strengthen your offers."
    },
    {
      icon: FaSearch,
      title: "Research & Inspect",
      description: "Inspect properties carefully and compare with recent comparable sales in the area."
    },
    {
      icon: FaHome,
      title: "Budget for Extras",
      description: "Account for stamp duty, legal fees, building inspections, and moving costs."
    }
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative h-80 md:h-[450px] overflow-hidden">
        <img 
          src={news2} 
          alt="First time buyers" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-4xl mx-auto">
            <Link 
              to="/news" 
              className="inline-flex items-center gap-2 text-white/80 hover:text-white 
                text-sm mb-4 transition-colors"
            >
              <FaArrowLeft />
              Back to News
            </Link>
            <span className="inline-block px-3 py-1 bg-teal-500 text-white text-xs 
              font-semibold rounded-full mb-4">
              <FaTag className="inline mr-1" />
              Buying Tips
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              First-Time Buyer's Guide
            </h1>
            <div className="flex items-center gap-4 text-white/70 text-sm">
              <span className="flex items-center gap-1">
                <FaCalendarAlt />
                Jan 12, 2025
              </span>
              <span>•</span>
              <span>5 min read</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Intro */}
        <div className="prose prose-lg max-w-none mb-12">
          <p className="text-xl text-gray-600 leading-relaxed">
            Buying your first property is exciting but can be complex. Start by reviewing your budget,
            understanding mortgage pre-approval, and setting realistic expectations for location
            and property condition. It helps to work with a buyer's agent who knows local markets.
          </p>
        </div>

        {/* Steps */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
              <FaCheckCircle className="text-teal-600" />
            </span>
            Practical Steps to Get Started
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map((step, index) => (
              <div 
                key={index}
                className="flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
                  <step.icon className="text-teal-600 text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">
                    {index + 1}. {step.title}
                  </h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tip Box */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-100 p-6 mb-12">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <FaLightbulb className="text-amber-600 text-xl" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Pro Tip</h3>
              <p className="text-gray-600">
                These starter tips are just the beginning. Seek personalised tax and legal advice when 
                finalising contracts and consider a formal building inspection before exchange. Having 
                experts on your side can save you from costly mistakes.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-3">Ready to Find Your First Home?</h3>
          <p className="text-teal-100 mb-6 max-w-md mx-auto">
            Browse our curated listings to find the perfect property for your needs and budget.
          </p>
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 px-6 py-3 
              bg-white text-teal-700 rounded-xl font-semibold
              hover:bg-gray-100 transition-colors shadow-lg"
          >
            <FaHome />
            Browse Properties
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FirstTimeBuyersGuide;
