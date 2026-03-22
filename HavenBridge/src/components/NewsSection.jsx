import React from 'react';
import { Link } from 'react-router-dom';
import { FaChevronRight, FaNewspaper, FaArrowRight, FaCalendar } from 'react-icons/fa';
import { latestNews } from '../data/constants';

const NewsSection = () => {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-orange-50 rounded-full blur-3xl opacity-30 -translate-x-1/2" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-teal-50 rounded-full blur-3xl opacity-40 translate-x-1/2" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-full 
              text-sm font-medium mb-4">
              <FaNewspaper />
              Latest Updates
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Property <span className="bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">News</span> & Insights
            </h2>
            <p className="text-gray-600 mt-2 max-w-lg">
              Stay informed with the latest real estate trends, market updates, and expert advice
            </p>
          </div>
          <Link 
            to="/news" 
            className="inline-flex items-center gap-2 text-teal-600 font-semibold hover:text-teal-700
              transition-colors group"
          >
            View All Articles 
            <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* News Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {latestNews.map((news, index) => (
            <Link
              to={news.link}
              key={news.id}
              className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 
                shadow-sm hover:shadow-xl hover:border-orange-100 
                transition-all duration-300 hover:-translate-y-1
                animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image */}
              <div className="relative h-52 overflow-hidden">
                <img
                  src={news.image}
                  alt={news.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Category badge */}
                <div className="absolute top-4 left-4">
                  <span className="bg-white/95 backdrop-blur-sm text-orange-600 text-xs font-bold 
                    uppercase tracking-wide px-3 py-1.5 rounded-full shadow-sm">
                    {news.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <FaCalendar className="text-orange-400" />
                  {news.date}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 
                  group-hover:text-orange-600 transition-colors line-clamp-2">
                  {news.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-4">
                  {news.description}
                </p>

                {/* Read More Link */}
                <div className="flex items-center gap-2 text-teal-600 font-semibold text-sm
                  group-hover:gap-3 transition-all duration-300">
                  Read Article
                  <FaChevronRight className="text-xs" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="mt-16 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 sm:p-10
          relative overflow-hidden">
          {/* Decorative */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />
          
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Want expert property insights in your inbox?
              </h3>
              <p className="text-gray-400">
                Subscribe to our newsletter for weekly market updates and tips
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-5 py-3 bg-white/10 backdrop-blur border border-white/20 rounded-xl
                  text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50
                  focus:border-orange-500 transition-all duration-200 w-full sm:w-64"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white 
                rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700
                shadow-lg hover:shadow-orange-500/25 transition-all duration-200 active:scale-[0.98]
                whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
