import React from 'react';
import { Link } from 'react-router-dom';
import news1 from '../assets/news1.jfif';
import LiveNewsWidget from '../components/LiveNewsWidget';
import { 
  FaChartLine, FaArrowLeft, FaCalendarAlt, FaTag, FaExclamationCircle,
  FaHome, FaPercent, FaBuilding, FaBriefcase
} from 'react-icons/fa';

const PropertyMarketTrends = () => {
  const watchPoints = [
    {
      icon: FaPercent,
      title: "Interest Rate Movements",
      description: "Monitor central bank decisions and lender appetite for mortgage lending."
    },
    {
      icon: FaBuilding,
      title: "Housing Supply",
      description: "Track new housing starts and supply constraints in your target areas."
    },
    {
      icon: FaBriefcase,
      title: "Work-Life Shifts",
      description: "Watch buyer preferences toward hybrid work-friendly locations and suburbs."
    }
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative h-80 md:h-[450px] overflow-hidden">
        <img 
          src={news1} 
          alt="Property market trends" 
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
            <span className="inline-block px-3 py-1 bg-purple-500 text-white text-xs 
              font-semibold rounded-full mb-4">
              <FaTag className="inline mr-1" />
              Market Analysis
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Property Market Trends for 2025
            </h1>
            <div className="flex items-center gap-4 text-white/70 text-sm">
              <span className="flex items-center gap-1">
                <FaCalendarAlt />
                Jan 15, 2025
              </span>
              <span>•</span>
              <span>4 min read</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Live Widget */}
        <div className="mb-10">
          <LiveNewsWidget />
        </div>

        {/* Intro */}
        <div className="prose prose-lg max-w-none mb-12">
          <p className="text-xl text-gray-600 leading-relaxed">
            The property market in 2025 is showing signs of stabilization after a period of rapid
            change. Key drivers include interest rate adjustments, increased urban redevelopment,
            and a continued appetite for suburban and regional properties. Investors should watch
            demand in growth corridors and monitor policy changes that affect housing supply.
          </p>
        </div>

        {/* What to Watch */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <FaChartLine className="text-purple-600" />
            </span>
            What to Watch
          </h2>
          <div className="space-y-4">
            {watchPoints.map((point, index) => (
              <div 
                key={index}
                className="flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
                  <point.icon className="text-purple-600 text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">{point.title}</h3>
                  <p className="text-sm text-gray-600">{point.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6 mb-12">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <FaExclamationCircle className="text-blue-600 text-xl" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Important Note</h3>
              <p className="text-gray-600 text-sm">
                This article provides a high-level overview of market trends. For detailed local market 
                analysis, consider reviewing neighbourhood-level sales and rental vacancy reports or 
                consulting a licensed property analyst for personalised advice.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-3">Explore Investment Opportunities</h3>
          <p className="text-purple-100 mb-6 max-w-md mx-auto">
            Browse our listings to find properties in growth corridors and high-demand areas.
          </p>
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 px-6 py-3 
              bg-white text-purple-700 rounded-xl font-semibold
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

export default PropertyMarketTrends;
