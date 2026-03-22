import React from "react";
import { Link } from "react-router-dom";
import { FaHome, FaCalendarCheck, FaShieldAlt, FaCreditCard, FaUsers, FaHandshake } from "react-icons/fa";

const features = [
  {
    icon: FaHome,
    title: "Property Discovery",
    description: "Browse verified listings with detailed information, high-quality photos, and virtual tours."
  },
  {
    icon: FaCalendarCheck,
    title: "Easy Visit Booking",
    description: "Schedule property visits with our streamlined booking workflow and get instant confirmations."
  },
  {
    icon: FaShieldAlt,
    title: "Admin Approvals",
    description: "Every listing is reviewed and approved by our team to ensure quality and authenticity."
  },
  {
    icon: FaCreditCard,
    title: "Secure Payments",
    description: "Stripe Connect integration ensures secure transactions with admin-controlled releases."
  }
];

const stats = [
  { value: "10,000+", label: "Properties Listed" },
  { value: "5,000+", label: "Happy Customers" },
  { value: "500+", label: "Verified Sellers" },
  { value: "98%", label: "Satisfaction Rate" }
];

const team = [
  {
    name: "Ahmad Khan",
    role: "Founder & CEO",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Sara Ahmed",
    role: "Head of Operations",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Ali Raza",
    role: "Tech Lead",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
  }
];

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-100 rounded-full blur-3xl opacity-30 -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-orange-100 rounded-full blur-3xl opacity-30 translate-y-1/2" />
        
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-full 
            text-sm font-medium mb-6 animate-fade-in">
            <FaHandshake className="text-teal-600" />
            Trusted Real Estate Platform
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 
            leading-tight animate-fade-in-up">
            About <span className="bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">HavenBridge</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed animate-fade-in-up"
            style={{ animationDelay: "100ms" }}>
            HavenBridge connects property buyers with verified sellers through a seamless platform 
            designed for transparency, security, and exceptional user experience.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-3xl p-8 sm:p-12 
            shadow-xl shadow-teal-600/20">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-teal-100 text-sm sm:text-base">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">What We Do</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform provides end-to-end solutions for property transactions
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-white rounded-2xl p-6 shadow-lg shadow-gray-100 border border-gray-100
                  hover:shadow-xl hover:shadow-teal-500/10 hover:border-teal-100 
                  transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 
                  flex items-center justify-center mb-5 shadow-lg shadow-teal-500/30
                  group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="text-white text-xl" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                We believe everyone deserves a seamless property buying experience. Our mission is to 
                bridge the gap between property seekers and sellers through technology, transparency, 
                and trust.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                From discovery to final payment, HavenBridge handles every step with security 
                and efficiency, making real estate transactions simpler than ever.
              </p>
              <Link 
                to="/properties"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-teal-700 
                  text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg 
                  hover:shadow-teal-500/25 transition-all duration-200 active:scale-[0.98]"
              >
                Explore Properties
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
            <div className="relative">
              <div className="absolute -top-6 -right-6 w-full h-full bg-teal-100 rounded-3xl" />
              <img 
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop"
                alt="Modern home"
                className="relative rounded-3xl shadow-2xl w-full h-80 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The passionate people behind HavenBridge
            </p>
          </div>
          
          <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {team.map((member, index) => (
              <div key={index} className="text-center group">
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full 
                    scale-105 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <img 
                    src={member.image}
                    alt={member.name}
                    className="relative w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg
                      group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                <p className="text-teal-600 text-sm font-medium">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 sm:p-12 text-center
            relative overflow-hidden">
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl" />
            
            <div className="relative">
              <FaUsers className="text-4xl text-teal-400 mx-auto mb-6" />
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Ready to Find Your Dream Property?
              </h2>
              <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                Join thousands of satisfied customers who found their perfect home through HavenBridge.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/signup"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 
                    text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-teal-500/25 
                    transition-all duration-200 active:scale-[0.98]"
                >
                  Get Started Free
                </Link>
                <Link 
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur 
                    text-white px-8 py-3.5 rounded-xl font-semibold border border-white/20
                    hover:bg-white/20 transition-all duration-200"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
