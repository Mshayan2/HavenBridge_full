import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaArrowRight } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { to: '/about', label: 'About Us' },
    { to: '/properties', label: 'Properties' },
    { to: '/sell', label: 'Sell Property' },
    { to: '/contact', label: 'Contact' },
  ];

  const services = [
    { to: '/contact', label: 'Property Valuation' },
    { to: '/contact', label: 'Market Analysis' },
    { to: '/contact', label: 'Legal Support' },
    { to: '/contact', label: 'Documentation' },
  ];

  const socialLinks = [
    { icon: FaFacebookF, href: '#', label: 'Facebook' },
    { icon: FaTwitter, href: '#', label: 'Twitter' },
    { icon: FaInstagram, href: '#', label: 'Instagram' },
    { icon: FaLinkedinIn, href: '#', label: 'LinkedIn' },
  ];

  return (
    <footer className="relative overflow-hidden">
      {/* Decorative top border */}
      <div className="h-1 bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600" />

      {/* Main Footer Content */}
      <div className="bg-gradient-to-br from-teal-800 via-teal-700 to-teal-800 text-white">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            
            {/* Brand Column */}
            <div className="lg:col-span-1">
              <h2 className="text-3xl font-bold text-white mb-4 font-prata">HavenBridge</h2>
              <p className="text-teal-100/90 text-base leading-relaxed mb-6">
                Connecting buyers and sellers for seamless property transactions. Your trusted partner in finding the perfect home.
              </p>
              
              {/* Social Links */}
              <div className="flex items-center gap-3">
                {socialLinks.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white hover:text-teal-700 
                      flex items-center justify-center transition-all duration-300 
                      hover:scale-110 hover:shadow-lg group"
                  >
                    <Icon className="w-4 h-4 text-white group-hover:text-teal-700 transition-colors" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links Column */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white flex items-center gap-2">
                <span className="w-8 h-0.5 bg-teal-400 rounded-full"></span>
                Quick Links
              </h3>
              <ul className="space-y-4">
                {quickLinks.map(({ to, label }) => (
                  <li key={to}>
                    <Link 
                      to={to} 
                      className="group flex items-center gap-2 text-teal-100/90 hover:text-white 
                        transition-all duration-300"
                    >
                      <FaArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 
                        group-hover:translate-x-0 transition-all duration-300 text-teal-400" />
                      <span className="group-hover:translate-x-1 transition-transform duration-300">
                        {label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services Column */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white flex items-center gap-2">
                <span className="w-8 h-0.5 bg-teal-400 rounded-full"></span>
                Services
              </h3>
              <ul className="space-y-4">
                {services.map(({ to, label }) => (
                  <li key={label}>
                    <Link 
                      to={to} 
                      className="group flex items-center gap-2 text-teal-100/90 hover:text-white 
                        transition-all duration-300"
                    >
                      <FaArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 
                        group-hover:translate-x-0 transition-all duration-300 text-teal-400" />
                      <span className="group-hover:translate-x-1 transition-transform duration-300">
                        {label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info Column */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white flex items-center gap-2">
                <span className="w-8 h-0.5 bg-teal-400 rounded-full"></span>
                Contact Info
              </h3>
              <ul className="space-y-5">
                <li className="flex items-start gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-white/10 group-hover:bg-teal-500 
                    flex items-center justify-center transition-all duration-300 flex-shrink-0">
                    <FaMapMarkerAlt className="text-white w-4 h-4" />
                  </div>
                  <span className="text-teal-100/90 text-sm leading-relaxed pt-2">
                    123 Real Estate Plaza,<br />City Center, Pakistan
                  </span>
                </li>
                <li className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-white/10 group-hover:bg-teal-500 
                    flex items-center justify-center transition-all duration-300 flex-shrink-0">
                    <FaPhone className="text-white w-4 h-4" />
                  </div>
                  <a 
                    href="tel:+15551234567" 
                    className="text-teal-100/90 hover:text-white text-sm transition-colors"
                  >
                    +1 (555) 123-4567
                  </a>
                </li>
                <li className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-white/10 group-hover:bg-teal-500 
                    flex items-center justify-center transition-all duration-300 flex-shrink-0">
                    <FaEnvelope className="text-white w-4 h-4" />
                  </div>
                  <a 
                    href="mailto:info@havenbridge.local" 
                    className="text-teal-100/90 hover:text-white text-sm transition-colors"
                  >
                    info@havenbridge.local
                  </a>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="bg-teal-900 py-5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-teal-200/80 text-sm">
              © {currentYear} HavenBridge. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link to="/privacy" className="text-teal-200/80 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-teal-200/80 hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;