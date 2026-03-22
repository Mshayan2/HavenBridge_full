import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaSearch, FaHome, FaUsers, FaShieldAlt } from "react-icons/fa";
import CustomDropdown from "./CustomDropdown";
import heroBg from "../assets/hero-bg.jpg";

const HeroSection = () => {
  const navigate = useNavigate();
  const [propertyType, setPropertyType] = useState("Any Type");
  const [priceRange, setPriceRange] = useState("Any Price");
  const [city, setCity] = useState("");
  const [areaInput, setAreaInput] = useState("");

  const stats = [
    { value: "1,200+", label: "Listings", icon: FaHome },
    { value: "850+", label: "Verified Sellers", icon: FaUsers },
    { value: "10k+", label: "Happy Users", icon: FaShieldAlt },
  ];

  return (
    <section className="relative text-white min-h-[85vh] flex items-center">
      {/* Background image with parallax effect */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ 
          backgroundImage: `url(${heroBg})`, 
          filter: 'brightness(0.55) contrast(1.05)' 
        }}
      />

      {/* Premium gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(135deg, 
              rgba(6, 95, 70, 0.85) 0%, 
              rgba(13, 148, 136, 0.7) 40%,
              rgba(15, 118, 110, 0.6) 70%,
              rgba(6, 95, 70, 0.75) 100%
            )
          `
        }}
      />

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Hero content */}
          <div className="text-left animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 
              backdrop-blur-sm border border-white/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm font-medium text-teal-100">Trusted by 10,000+ customers</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold 
              leading-[1.1] tracking-tight">
              Find your
              <span className="block mt-2 bg-gradient-to-r from-white via-teal-100 to-teal-200 
                bg-clip-text text-transparent">
                dream home
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-teal-100/90 max-w-xl leading-relaxed">
              Browse verified listings, connect with sellers, and manage your offers — 
              all in one seamless platform designed for modern homebuyers.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mt-10">
              <button
                onClick={() => navigate('/properties')}
                className="group inline-flex items-center gap-3 px-8 py-4 
                  bg-white text-teal-700 font-bold rounded-xl 
                  shadow-lg shadow-black/10 hover:shadow-2xl hover:shadow-black/20 
                  transition-all duration-300 hover:-translate-y-1"
              >
                <FaHome className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Browse Properties
              </button>

              <button
                className="group inline-flex items-center gap-3 px-8 py-4 
                  border-2 border-white/30 text-white font-semibold rounded-xl 
                  bg-white/5 backdrop-blur-sm hover:bg-white/15 hover:border-white/50
                  transition-all duration-300"
              >
                <FaCheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Free Valuation
              </button>
            </div>

            {/* Quick stats */}
            <div className="flex flex-wrap items-center gap-8 mt-12 pt-8 border-t border-white/10">
              {stats.map(({ value, label, icon: Icon }) => (
                <div key={label} className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center
                    group-hover:bg-white/20 transition-colors">
                    <Icon className="w-5 h-5 text-teal-300" />
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-white">{value}</div>
                    <div className="text-sm text-teal-200/80">{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Search card */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/20 
              p-6 sm:p-8 text-gray-900 border border-white/50">
              {/* Card header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 
                  flex items-center justify-center shadow-lg shadow-teal-500/30">
                  <FaSearch className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Find Properties</h3>
                  <p className="text-sm text-gray-500">Search from 1,200+ verified listings</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Lahore"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 
                      text-gray-800 placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500
                      transition-all duration-200"
                  />
                </div>

                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Area
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., DHA Phase 5"
                    value={areaInput}
                    onChange={(e) => setAreaInput(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 
                      text-gray-800 placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500
                      transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Property Type
                  </label>
                  <CustomDropdown
                    options={["Any Type", "House", "Apartment", "Plot", "Villa"]}
                    selected={propertyType}
                    setSelected={setPropertyType}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Price Range
                  </label>
                  <CustomDropdown
                    options={[
                      "Any Price",
                      "Under 20 Lac",
                      "20 Lac – 50 Lac",
                      "50 Lac – 1 Crore",
                      "1 Crore+",
                    ]}
                    selected={priceRange}
                    setSelected={setPriceRange}
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  const params = new URLSearchParams();
                  if (city && city.trim()) params.set('location', city.trim());
                  if (areaInput && areaInput.trim()) {
                    const existing = params.get('location') || '';
                    params.set('location', (existing + ' ' + areaInput.trim()).trim());
                  }
                  const typeMap = { Apartment: 'apartment', House: 'house', Plot: 'plot', Villa: 'villa' };
                  const mapped = typeMap[propertyType];
                  if (mapped) params.set('type', mapped);
                  switch (priceRange) {
                    case 'Under 20 Lac': params.set('maxPrice', String(2000000)); break;
                    case '20 Lac – 50 Lac': params.set('minPrice', String(2000000)); params.set('maxPrice', String(5000000)); break;
                    case '50 Lac – 1 Crore': params.set('minPrice', String(5000000)); params.set('maxPrice', String(10000000)); break;
                    case '1 Crore+': params.set('minPrice', String(10000000)); break;
                    default: break;
                  }
                  const qs = params.toString();
                  navigate(`/properties${qs ? `?${qs}` : ''}`);
                }}
                className="mt-6 w-full inline-flex items-center justify-center gap-3 
                  bg-gradient-to-r from-orange-500 to-orange-600 
                  hover:from-orange-600 hover:to-orange-700
                  text-white font-bold text-lg py-4 rounded-xl 
                  shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40
                  transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <FaSearch className="w-5 h-5" />
                Search Properties
              </button>

              {/* Popular searches */}
              <div className="mt-5 pt-5 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-3">Popular searches:</p>
                <div className="flex flex-wrap gap-2">
                  {['DHA Lahore', 'Bahria Town', 'Gulberg', 'Model Town'].map((term) => (
                    <button
                      key={term}
                      onClick={() => setCity(term)}
                      className="px-3 py-1.5 text-xs font-medium rounded-full 
                        bg-gray-100 text-gray-600 hover:bg-teal-50 hover:text-teal-700
                        transition-colors duration-200"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
