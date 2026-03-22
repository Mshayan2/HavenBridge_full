import React from 'react';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaChartLine, FaUsers, FaStar, FaCheckCircle, FaArrowRight, FaQuoteLeft } from 'react-icons/fa';

const WhyChooseUs = () => {
  const features = [
    {
      icon: FaShieldAlt,
      title: "Secure Transactions",
      description: "Advanced encryption and verified payments protect every transaction on our platform.",
      color: "teal"
    },
    {
      icon: FaChartLine,
      title: "Market Insights",
      description: "Real-time property valuations and market trends to help you make informed decisions.",
      color: "indigo"
    },
    {
      icon: FaUsers,
      title: "Direct Connect",
      description: "Connect directly with verified property owners — no middlemen, no hidden fees.",
      color: "orange"
    },
    {
      icon: FaStar,
      title: "Trusted Platform",
      description: "Join thousands of satisfied buyers and sellers who found their perfect match.",
      color: "teal"
    }
  ];

  const colorStyles = {
    teal: "from-teal-500 to-teal-600 shadow-teal-500/30",
    indigo: "from-indigo-500 to-indigo-600 shadow-indigo-500/30",
    orange: "from-orange-500 to-orange-600 shadow-orange-500/30",
  };

  const stats = [
    { value: "10K+", label: "Properties Listed", icon: "🏠" },
    { value: "95%", label: "Customer Satisfaction", icon: "⭐" },
    { value: "24/7", label: "Customer Support", icon: "🎧" },
    { value: "50+", label: "Cities Covered", icon: "🌍" },
  ];

  const testimonials = [
    {
      quote: "HavenBridge made finding my dream home incredibly easy. The process was smooth and transparent.",
      author: "Sarah Ahmed",
      role: "Home Buyer",
      avatar: "S"
    },
    {
      quote: "I sold my property in just 2 weeks! The platform's reach and professional service are unmatched.",
      author: "Ahmed Khan",
      role: "Property Seller",
      avatar: "A"
    }
  ];

  return (
    <section className="py-24 bg-gray-50 relative overflow-hidden">
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-full 
            text-sm font-medium mb-4">
            <FaStar className="text-teal-600" />
            Why HavenBridge
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Why Choose <span className="bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">Us</span>?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Trusted, professional, and tailored real estate services for every step of your journey
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group bg-white rounded-2xl p-8 border border-gray-100 shadow-sm
                hover:shadow-xl hover:border-teal-100 hover:-translate-y-2 transition-all duration-300"
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorStyles[feature.color]}
                flex items-center justify-center mb-6 shadow-lg
                group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="text-white text-xl" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-teal-600 transition-colors">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed mb-4">
                {feature.description}
              </p>

              {/* Decorative accent */}
              <div className="w-10 h-1 bg-gradient-to-r from-teal-500 to-teal-400 rounded-full
                group-hover:w-16 transition-all duration-300" />
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-3xl p-8 sm:p-12 mb-20
          shadow-xl shadow-teal-600/20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-teal-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h3>
            <p className="text-gray-600">Real stories from real people</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm
                relative overflow-hidden">
                <FaQuoteLeft className="absolute top-6 right-6 text-4xl text-teal-100" />
                <p className="text-gray-700 text-lg mb-6 relative z-10 leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-teal-600
                    flex items-center justify-center text-white font-bold shadow-lg shadow-teal-500/25">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          {/* Decorative */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl" />
          
          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Ready to Get Started?
              </h3>
              <p className="text-gray-400 max-w-lg">
                Join thousands of satisfied customers who found their perfect property through HavenBridge.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/signup" 
                className="inline-flex items-center justify-center gap-2 px-8 py-4 
                  bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl 
                  font-semibold shadow-lg hover:shadow-teal-500/25 
                  transition-all duration-200 active:scale-[0.98]"
              >
                <FaCheckCircle /> Get Started Free
              </Link>
              <Link 
                to="/properties" 
                className="inline-flex items-center justify-center gap-2 px-8 py-4 
                  bg-white/10 backdrop-blur text-white rounded-xl font-semibold 
                  border border-white/20 hover:bg-white/20 transition-all duration-200"
              >
                Browse Properties <FaArrowRight className="text-sm" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
