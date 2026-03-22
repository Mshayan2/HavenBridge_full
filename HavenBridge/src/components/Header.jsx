import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo2.png";
import Button from './ui/Button';
import { FaUser, FaCalendarAlt, FaHeart, FaBookmark, FaEnvelope, FaFileAlt, FaBell, FaPlus, FaTachometerAlt, FaHome, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const authRef = useRef(null);
  const menuRef = useRef(null);

  const location = useLocation();

  // Handle scroll for header shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update user when location changes (covers navigation after sign-in)
  useEffect(() => {
    const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch (_e) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [location]);

  // Also listen to storage events (other tabs) and manual localStorage changes
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "user" || e.key === "token") {
        const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
        if (raw) {
          try {
            setUser(JSON.parse(raw));
          } catch (_err) {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const onMouseDown = (e) => {
      if (authRef.current && !authRef.current.contains(e.target)) {
        setIsAuthOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsAuthOpen(false);
  }, [location?.pathname]);

  const displayName = user?.name || user?.email || "User";
  const initial = String(displayName).trim().charAt(0).toUpperCase() || "U";

  // Navigation link component for consistent styling
  const NavLink = ({ to, children }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        className={`relative font-semibold text-sm tracking-wide transition-all duration-200
          ${isActive 
            ? 'text-white' 
            : 'text-white/85 hover:text-white'
          }
          after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:bg-white after:transition-all after:duration-300
          ${isActive ? 'after:w-full' : 'after:w-0 hover:after:w-full'}
        `}
      >
        {children}
      </Link>
    );
  };

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 
        ${scrolled 
          ? 'bg-gradient-to-r from-teal-700 via-teal-600 to-teal-700 shadow-lg shadow-teal-900/20' 
          : 'bg-gradient-to-r from-teal-600 via-teal-600 to-teal-600'
        }
      `}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center group">
          <img
            src={logo}
            alt="HavenBridge Logo"
            className="h-10 w-20 sm:h-11 sm:w-22 md:h-12 md:w-24 object-contain 
              transition-all duration-300 group-hover:scale-105 group-hover:brightness-110"
          />
        </Link>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center gap-8">
          <NavLink to="/">HOME</NavLink>
          <NavLink to="/properties">PROPERTIES</NavLink>
          <NavLink to="/about">ABOUT</NavLink>
          <NavLink to="/contact">CONTACT</NavLink>
        </nav>

        {/* Right Section */}
        <div className="relative flex items-center gap-3">

          {/* Mobile menu button */}
          <div className="md:hidden" ref={menuRef}>
            <button
              type="button"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((v) => !v)}
              className="inline-flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 
                px-3 py-2.5 transition-all duration-200 active:scale-95 backdrop-blur-sm"
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6H19" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M3 11H19" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M3 16H19" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>

            {isMenuOpen ? (
              // Fullscreen mobile drawer with refined styling
              <div className="fixed inset-0 z-50 animate-fade-in">
                <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
                <div className="absolute right-0 top-0 w-4/5 max-w-sm h-full bg-white shadow-2xl overflow-auto animate-slide-in-right">
                  <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
                    <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3">
                      <img src={logo} alt="HavenBridge" className="h-9 w-auto" />
                      <span className="font-bold text-lg text-gray-800">HavenBridge</span>
                    </Link>
                    <button 
                      onClick={() => setIsMenuOpen(false)} 
                      aria-label="Close menu" 
                      className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors text-gray-500"
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M5 5L15 15M5 15L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>

                  <nav className="flex flex-col p-4 gap-1">
                    {[
                      { to: '/', label: 'Home', icon: <FaHome /> },
                      { to: '/properties', label: 'Properties', icon: <FaHome /> },
                      { to: '/about', label: 'About', icon: <FaUser /> },
                      { to: '/contact', label: 'Contact', icon: <FaEnvelope /> },
                    ].map(({ to, label, icon }) => (
                      <Link 
                        key={to}
                        to={to} 
                        onClick={() => setIsMenuOpen(false)} 
                        className={`flex items-center gap-3 py-3.5 px-4 rounded-xl font-medium transition-all duration-200
                          ${location.pathname === to 
                            ? 'bg-teal-50 text-teal-700' 
                            : 'text-gray-700 hover:bg-gray-50'
                          }
                        `}
                      >
                        <span className="text-teal-600">{icon}</span>
                        {label}
                      </Link>
                    ))}
                  </nav>

                  <div className="border-t border-gray-100 mx-4 my-2" />

                  <div className="flex flex-col p-4 gap-2">
                    <Button
                      onClick={() => { setIsMenuOpen(false); navigate('/sell', { state: { fromHeader: true } }); }}
                      className="w-full justify-center"
                      variant="primary"
                      size="lg"
                    >
                      <FaPlus className="w-4 h-4" />
                      Sell Property
                    </Button>

                    {user ? (
                      <div className="mt-3 space-y-1">
                        <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold px-4 mb-2">Account</p>
                        {[
                          { to: '/profile', label: 'Profile', icon: <FaUser /> },
                          { to: '/my-bookings', label: 'My Bookings', icon: <FaCalendarAlt /> },
                          { to: '/my-favorites', label: 'My Favorites', icon: <FaHeart /> },
                          { to: '/messages', label: 'Messages', icon: <FaEnvelope /> },
                          { to: '/leases', label: 'Leases', icon: <FaFileAlt /> },
                          { to: '/my-reservations', label: 'My Reservations', icon: <FaFileAlt /> },
                          { to: '/notifications', label: 'Notifications', icon: <FaBell /> },
                          { to: '/saved-searches', label: 'Saved Searches', icon: <FaBookmark /> },
                          { to: '/my-listings', label: 'My Listings', icon: <FaTachometerAlt /> },
                        ].map(({ to, label, icon }) => (
                          <button 
                            key={to}
                            onClick={() => { setIsMenuOpen(false); navigate(to); }} 
                            className="w-full text-left py-3 px-4 rounded-xl hover:bg-gray-50 flex items-center gap-3 text-gray-700 transition-colors"
                          >
                            <span className="text-teal-500 w-5">{icon}</span>
                            {label}
                          </button>
                        ))}
                        <div className="border-t border-gray-100 my-3" />
                        <button 
                          onClick={() => {
                            localStorage.removeItem('token');
                            localStorage.removeItem('user');
                            sessionStorage.removeItem('token');
                            sessionStorage.removeItem('user');
                            setUser(null);
                            setIsMenuOpen(false);
                            navigate('/');
                          }} 
                          className="w-full text-left py-3 px-4 rounded-xl text-red-600 hover:bg-red-50 flex items-center gap-3 font-medium transition-colors"
                        >
                          <FaSignOutAlt className="w-5" />
                          Logout
                        </button>
                      </div>
                    ) : (
                      <div className="mt-3 space-y-2">
                        <Button 
                          onClick={() => { setIsMenuOpen(false); navigate('/signin'); }} 
                          className="w-full justify-center"
                          variant="outline"
                        >
                          Sign In
                        </Button>
                        <Button 
                          onClick={() => { setIsMenuOpen(false); navigate('/signup'); }} 
                          className="w-full justify-center"
                          variant="teal"
                        >
                          Sign Up
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Auth / User menu */}
          {user ? (
            <div className="relative" ref={authRef}>
              <button
                onClick={() => setIsAuthOpen(!isAuthOpen)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm 
                  rounded-xl px-3 py-2 transition-all duration-200 group"
              >
                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 
                  text-white flex items-center justify-center font-semibold text-sm shadow-inner">
                  {initial}
                </span>
                <span className="hidden sm:inline text-white font-medium text-sm max-w-[120px] truncate">
                  {displayName}
                </span>
                <FaChevronDown className={`hidden sm:block w-3 h-3 text-white/70 transition-transform duration-200 
                  ${isAuthOpen ? 'rotate-180' : ''}`} 
                />
              </button>

              {isAuthOpen && (
                <div className="absolute right-0 top-14 w-[420px] bg-white rounded-2xl shadow-2xl 
                  ring-1 ring-black/5 overflow-hidden z-50 animate-scale-in origin-top-right">
                  {/* User Info Header */}
                  <div className="p-5 bg-gradient-to-r from-teal-50 to-gray-50 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 
                        text-white flex items-center justify-center font-bold text-xl shadow-lg">
                        {initial}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{displayName}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          Verified Member
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Grid */}
                  <div className="p-5 grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-3">Personal</div>
                      {[
                        { to: '/profile', label: 'Profile Settings', icon: <FaUser /> },
                        { to: '/my-bookings', label: 'My Bookings', icon: <FaCalendarAlt /> },
                        { to: '/my-favorites', label: 'Favorites', icon: <FaHeart /> },
                        { to: '/saved-searches', label: 'Saved Searches', icon: <FaBookmark /> },
                      ].map(({ to, label, icon }) => (
                        <button 
                          key={to}
                          onClick={() => { setIsAuthOpen(false); navigate(to); }} 
                          className="w-full text-left py-2.5 flex items-center gap-3 rounded-lg px-3 
                            hover:bg-gray-50 transition-colors group"
                        >
                          <span className="text-teal-600 group-hover:scale-110 transition-transform">{icon}</span>
                          <span className="text-sm text-gray-700">{label}</span>
                        </button>
                      ))}
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-3">Activity</div>
                      {[
                        { to: '/messages', label: 'Messages', icon: <FaEnvelope /> },
                        { to: '/notifications', label: 'Notifications', icon: <FaBell /> },
                        { to: '/seller/bookings', label: 'Seller Bookings', icon: <FaTachometerAlt /> },
                        { to: '/leases', label: 'Leases', icon: <FaFileAlt /> },
                        { to: '/my-reservations', label: 'My Reservations', icon: <FaFileAlt /> },
                      ].map(({ to, label, icon }) => (
                        <button 
                          key={to}
                          onClick={() => { setIsAuthOpen(false); navigate(to); }} 
                          className="w-full text-left py-2.5 flex items-center gap-3 rounded-lg px-3 
                            hover:bg-gray-50 transition-colors group"
                        >
                          <span className="text-teal-600 group-hover:scale-110 transition-transform">{icon}</span>
                          <span className="text-sm text-gray-700">{label}</span>
                        </button>
                      ))}
                      <div className="mt-4 flex flex-col gap-2">
                        <button 
                          onClick={() => { setIsAuthOpen(false); navigate('/sell', { state: { fromHeader: true } }); }} 
                          className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 
                            text-white flex items-center gap-2 justify-center hover:shadow-lg 
                            hover:shadow-teal-500/25 transition-all duration-200"
                        >
                          <FaPlus className="w-4 h-4"/>
                          <span className="text-sm font-semibold">Sell Property</span>
                        </button>
                        <button 
                          onClick={() => { setIsAuthOpen(false); navigate('/seller/stripe'); }} 
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 
                            flex items-center gap-2 justify-center hover:bg-gray-50 transition-colors"
                        >
                          <span className="text-sm text-gray-700">Setup Payouts</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="border-t border-gray-100 p-4 bg-gray-50/50 flex items-center justify-between">
                    <div>
                      {user.role === 'admin' && (
                        <button 
                          onClick={() => { setIsAuthOpen(false); navigate('/admin/dashboard'); }} 
                          className="text-sm text-gray-600 hover:text-teal-600 flex items-center gap-2 
                            px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <FaTachometerAlt className="w-4 h-4"/>
                          Admin Dashboard
                        </button>
                      )}
                    </div>
                    <button 
                      onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        sessionStorage.removeItem('token');
                        sessionStorage.removeItem('user');
                        setUser(null);
                        navigate('/');
                      }} 
                      className="text-red-600 font-semibold px-4 py-2 rounded-lg hover:bg-red-50 
                        flex items-center gap-2 transition-colors"
                    >
                      <FaSignOutAlt className="w-4 h-4"/>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="relative hidden md:block" ref={authRef}>
                <Button
                  onClick={() => setIsAuthOpen(!isAuthOpen)}
                  variant="ghost"
                  size="sm"
                  className="border border-white/20"
                >
                  SIGN IN
                  <FaChevronDown className={`w-3 h-3 transition-transform duration-200 ${isAuthOpen ? 'rotate-180' : ''}`} />
                </Button>

                {/* Dropdown */}
                {isAuthOpen && (
                  <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl 
                    ring-1 ring-black/5 overflow-hidden z-50 animate-scale-in origin-top-right">
                    <button
                      onClick={() => { navigate('/signin'); setIsAuthOpen(false); }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 font-medium text-gray-800 
                        flex items-center gap-3 transition-colors"
                    >
                      <FaUser className="text-teal-600 w-4 h-4"/>
                      Sign In
                    </button>
                    <button
                      onClick={() => { navigate('/signup'); setIsAuthOpen(false); }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 font-medium text-gray-800 
                        flex items-center gap-3 border-t border-gray-100 transition-colors"
                    >
                      <FaPlus className="text-teal-600 w-4 h-4"/>
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* SELL PROPERTY */}
          <div className="hidden md:block">
            <Button
              onClick={() => navigate('/sell', { state: { fromHeader: true } })}
              variant="primary"
              size="sm"
            >
              SELL PROPERTY
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
