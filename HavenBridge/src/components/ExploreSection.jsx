import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronRight, FaHome, FaSearch, FaHandshake, FaTags, FaChartLine, FaCamera, FaBook, FaMapMarkedAlt } from "react-icons/fa";

const ExploreSection = () => {
  const [activeTab, setActiveTab] = useState("Buying");

  const tabs = [
    { id: 1, title: "Buying", icon: FaHome },
    { id: 2, title: "Selling", icon: FaTags },
    { id: 3, title: "Researching", icon: FaChartLine },
  ];

  const tabContent = {
    Buying: {
      mainTitle: "Find Your Perfect Home",
      mainDescription: "Browse thousands of verified properties with detailed information, virtual tours, and instant booking options.",
      mainButton: "Browse Properties",
      mainLink: "/properties",
      rightTitle: "Get Instant Property Valuations",
      rightDescription: "Use our smart tools to estimate property values and make informed decisions on your purchase.",
      bottomTitle: "Connect Directly with Sellers",
      bottomDescription: "Message sellers directly, schedule visits, and negotiate without intermediaries.",
    },
    Selling: {
      mainTitle: "Sell Your Property Fast",
      mainDescription: "List your property in minutes and reach thousands of verified buyers looking for homes like yours.",
      mainButton: "List Your Property",
      mainLink: "/sell",
      rightTitle: "Maximize Your Sale Price",
      rightDescription: "Get professional valuation insights and market analysis to price your property competitively.",
      bottomTitle: "Professional Photography Included",
      bottomDescription: "Premium listings include professional photography to showcase your property at its best.",
    },
    Researching: {
      mainTitle: "Property Market Research",
      mainDescription: "Access comprehensive market data, trends, and insights to stay ahead in real estate.",
      mainButton: "View Market Trends",
      mainLink: "/market-trends",
      rightTitle: "Read Expert Insights",
      rightDescription: "Stay informed with our curated articles, guides, and market reports from industry experts.",
      bottomTitle: "Compare Neighborhood Profiles",
      bottomDescription: "Detailed area comparisons including schools, amenities, transport, and lifestyle factors.",
    },
  };

  const icons = {
    Buying: { main: FaHome, right: FaSearch, bottom: FaHandshake },
    Selling: { main: FaTags, right: FaChartLine, bottom: FaCamera },
    Researching: { main: FaChartLine, right: FaBook, bottom: FaMapMarkedAlt },
  };

  const colors = {
    Buying: { main: "teal", right: "indigo", bottom: "orange" },
    Selling: { main: "orange", right: "teal", bottom: "indigo" },
    Researching: { main: "indigo", right: "orange", bottom: "teal" },
  };

  const colorStyles = {
    teal: {
      bg: "bg-teal-50",
      border: "border-teal-100",
      text: "text-teal-600",
      button: "bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800",
      link: "text-teal-600 hover:text-teal-700"
    },
    indigo: {
      bg: "bg-indigo-50",
      border: "border-indigo-100",
      text: "text-indigo-600",
      button: "bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800",
      link: "text-indigo-600 hover:text-indigo-700"
    },
    orange: {
      bg: "bg-orange-50",
      border: "border-orange-100",
      text: "text-orange-500",
      button: "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700",
      link: "text-orange-500 hover:text-orange-600"
    },
  };

  const currentContent = tabContent[activeTab];
  const currentIcons = icons[activeTab];
  const currentColors = colors[activeTab];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-teal-50 rounded-full blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-orange-50 rounded-full blur-3xl opacity-40 translate-x-1/2 translate-y-1/2" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full 
            text-sm font-medium mb-4">
            <FaSearch className="text-teal-600" />
            Explore Resources
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Explore all things <span className="bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">property</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Whether you're buying, selling, or researching — we have the tools and resources you need
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-gray-100 rounded-2xl p-1.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.title)}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-xl text-sm sm:text-base font-semibold transition-all duration-300
                  ${activeTab === tab.title
                    ? "bg-white text-gray-900 shadow-md"
                    : "text-gray-600 hover:text-gray-900"
                  }
                `}
              >
                <tab.icon className={activeTab === tab.title ? "text-teal-600" : ""} />
                {tab.title}
              </button>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Card */}
          <div className="group bg-white rounded-2xl border border-gray-100 p-8 shadow-sm 
            hover:shadow-xl hover:border-teal-100 transition-all duration-300">
            <div className={`w-16 h-16 rounded-2xl ${colorStyles[currentColors.main].bg} ${colorStyles[currentColors.main].border}
              flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
              {React.createElement(currentIcons.main, { className: `text-2xl ${colorStyles[currentColors.main].text}` })}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{currentContent.mainTitle}</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">{currentContent.mainDescription}</p>
            <Link 
              to={currentContent.mainLink}
              className={`inline-flex items-center gap-2 px-6 py-3 ${colorStyles[currentColors.main].button}
                text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200
                active:scale-[0.98]`}
            >
              {currentContent.mainButton}
              <FaChevronRight className="text-sm" />
            </Link>
          </div>

          {/* Right Card */}
          <div className="group bg-white rounded-2xl border border-gray-100 p-8 shadow-sm 
            hover:shadow-xl hover:border-indigo-100 transition-all duration-300">
            <div className={`w-16 h-16 rounded-2xl ${colorStyles[currentColors.right].bg} ${colorStyles[currentColors.right].border}
              flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
              {React.createElement(currentIcons.right, { className: `text-2xl ${colorStyles[currentColors.right].text}` })}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{currentContent.rightTitle}</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">{currentContent.rightDescription}</p>
            <button className={`inline-flex items-center gap-2 ${colorStyles[currentColors.right].link}
              font-semibold transition-colors group/btn`}>
              Learn more 
              <FaChevronRight className="text-sm group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Bottom Card */}
          <div className="group bg-white rounded-2xl border border-gray-100 p-8 shadow-sm 
            hover:shadow-xl hover:border-orange-100 transition-all duration-300">
            <div className={`w-16 h-16 rounded-2xl ${colorStyles[currentColors.bottom].bg} ${colorStyles[currentColors.bottom].border}
              flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
              {React.createElement(currentIcons.bottom, { className: `text-2xl ${colorStyles[currentColors.bottom].text}` })}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{currentContent.bottomTitle}</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">{currentContent.bottomDescription}</p>
            <button className={`inline-flex items-center gap-2 ${colorStyles[currentColors.bottom].link}
              font-semibold transition-colors group/btn`}>
              Learn more 
              <FaChevronRight className="text-sm group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExploreSection;
