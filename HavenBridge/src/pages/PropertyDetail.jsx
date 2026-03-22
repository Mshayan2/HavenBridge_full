import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPropertyById } from '../api/properties';
import SEO from '../components/SEO';
import { getApiHost, toAssetUrl } from '../utils/url';
import { FaHeart, FaRegHeart, FaBed, FaBath, FaRulerCombined, FaCalendar, FaMapMarkerAlt, FaHome, FaTag, FaUser, FaEnvelope, FaArrowLeft, FaCheck, FaFileAlt } from "react-icons/fa";
import { useFavorites } from "../contexts/FavoritesContext";
import PropertyMap from "../components/PropertyMap";
import { requestLease } from "../api/leases";

export default function PropertyDetail(){
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(()=>{
    const controller = new AbortController();
    let mounted = true;
    (async ()=>{
      try{
        const data = await getPropertyById(id, { signal: controller.signal });
        if (!mounted) return;
        setProperty(data);
      }catch(e){
        if (e?.aborted || e?.name === 'AbortError') return;
        console.error(e);
      }finally{
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      controller.abort();
    };
  },[id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-96 bg-gray-200 rounded-2xl"></div>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <FaHome className="text-gray-400 text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h2>
          <p className="text-gray-600 mb-6">The property you're looking for doesn't exist or has been removed.</p>
          <Link 
            to="/properties" 
            className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold
              hover:bg-teal-700 transition-colors"
          >
            <FaArrowLeft /> Browse Properties
          </Link>
        </div>
      </div>
    );
  }

  const canonical = typeof window !== 'undefined' ? window.location.href : undefined;
  const desc = property.description
    ? String(property.description).slice(0, 155)
    : `Explore ${property.title || 'property'} in ${property.location || 'your area'}.`;

  const imgUrl = (p) => toAssetUrl(p);
  const docUrl = (p) => (p ? toAssetUrl(p, { fallback: null }) : null);

  const specs = [
    { icon: FaBed, label: "Bedrooms", value: property.bedrooms || '—' },
    { icon: FaBath, label: "Bathrooms", value: property.bathrooms || '—' },
    { icon: FaRulerCombined, label: "Area", value: property.area || '—' },
    { icon: FaCalendar, label: "Posted", value: property.createdAt ? new Date(property.createdAt).toLocaleDateString() : '—' },
  ];

  const isRental = property?.rental?.enabled;
  const priceDisplay = isRental
    ? `${String(property.rental.currency || 'PKR').toUpperCase()} ${Number(property.rental.monthlyRentMinor || 0).toLocaleString()}`
    : `PKR ${property.price?.toLocaleString?.() || property.price}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <SEO
        title={property.title}
        description={desc}
        canonical={canonical}
        image={property?.images?.[0] ? imgUrl(property.images[0]) : undefined}
      />

      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to="/properties" 
              className="inline-flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors"
            >
              <FaArrowLeft className="text-sm" />
              <span className="font-medium">Back to listings</span>
            </Link>
            <button
              type="button"
              aria-label={isFavorite(property._id) ? "Remove from favorites" : "Add to favorites"}
              onClick={() => toggleFavorite(property._id)}
              className={`w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-all duration-200
                hover:scale-105 active:scale-95 ${
                isFavorite(property._id) 
                  ? "bg-red-500 text-white shadow-red-500/25" 
                  : "bg-white text-gray-600 hover:text-red-500"
              }`}
            >
              {isFavorite(property._id) ? <FaHeart /> : <FaRegHeart />}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title & Price */}
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide
                  ${property.status === 'available' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600'}`}
                >
                  {property.status}
                </span>
                <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-semibold">
                  {property.type}
                </span>
                {isRental && (
                  <span className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-semibold">
                    For Rent
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">{property.title}</h1>
              <div className="flex items-center gap-2 text-gray-500">
                <FaMapMarkerAlt className="text-teal-600" />
                <span>{property.location}</span>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="space-y-4">
              {property.images && property.images.length > 0 ? (
                <>
                  {/* Main Image */}
                  <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-[16/10]">
                    <img 
                      src={imgUrl(property.images[activeImage])} 
                      alt={property.title} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const img = e.currentTarget;
                        if (img.dataset._hadError) return;
                        img.dataset._hadError = '1';
                        img.onerror = null;
                        img.src = '/vite.svg';
                      }}
                    />
                    {/* Image counter */}
                    <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white 
                      px-3 py-1.5 rounded-full text-sm font-medium">
                      {activeImage + 1} / {property.images.length}
                    </div>
                  </div>
                  
                  {/* Thumbnails */}
                  {property.images.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {property.images.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImage(i)}
                          className={`flex-shrink-0 w-24 h-16 rounded-xl overflow-hidden transition-all duration-200
                            ${activeImage === i 
                              ? 'ring-2 ring-teal-500 ring-offset-2' 
                              : 'opacity-70 hover:opacity-100'}`}
                        >
                          <img 
                            src={imgUrl(img)} 
                            alt={`${property.title} ${i + 1}`} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const img = e.currentTarget;
                              if (img.dataset._hadError) return;
                              img.dataset._hadError = '1';
                              img.onerror = null;
                              img.src = '/vite.svg';
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full aspect-[16/10] bg-gray-100 rounded-2xl flex items-center justify-center">
                  <FaHome className="text-gray-300 text-6xl" />
                </div>
              )}
            </div>

            {/* Price Card (Mobile) */}
            <div className="lg:hidden bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-6 text-white">
              <div className="text-teal-100 text-sm mb-1">
                {isRental ? 'Monthly Rent' : 'Price'}
              </div>
              <div className="text-3xl font-bold">
                {priceDisplay}
                {isRental && <span className="text-lg font-normal text-teal-200"> / month</span>}
              </div>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {specs.map((spec, i) => (
                <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm
                  hover:shadow-md hover:border-teal-100 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
                      <spec.icon className="text-teal-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">{spec.label}</div>
                      <div className="font-semibold text-gray-900">{spec.value}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{property.description}</p>
            </div>

            {/* Features */}
            {property.features && property.features.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Features & Amenities</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {property.features.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <FaCheck className="text-green-600 text-xs" />
                      </div>
                      <span className="text-gray-700">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Map */}
            {Array.isArray(property?.geo?.coordinates) && property.geo.coordinates.length === 2 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Location</h2>
                <div className="rounded-xl overflow-hidden">
                  <PropertyMap
                    properties={[property]}
                    initialCenter={[property.geo.coordinates[1], property.geo.coordinates[0]]}
                    initialZoom={14}
                    className="h-64 sm:h-80"
                  />
                </div>
              </div>
            )}

            {/* Documents */}
            {property.documents && Object.keys(property.documents).length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Documents</h2>
                <div className="space-y-3">
                  {Object.entries(property.documents).map(([k, v]) => {
                    const href = docUrl(v) || '#';
                    return (
                      <a 
                        key={k} 
                        href={href} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-teal-50 
                          border border-gray-100 hover:border-teal-200 transition-all duration-200"
                      >
                        <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                          <FaFileAlt className="text-teal-600" />
                        </div>
                        <span className="text-teal-700 font-medium">{k}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Price Card (Desktop) */}
              <div className="hidden lg:block bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-6 text-white
                shadow-xl shadow-teal-600/20">
                <div className="text-teal-100 text-sm mb-1">
                  {isRental ? 'Monthly Rent' : 'Price'}
                </div>
                <div className="text-3xl font-bold mb-4">
                  {priceDisplay}
                  {isRental && <span className="text-lg font-normal text-teal-200"> / month</span>}
                </div>
                {isRental && property.rental.depositMinor && (
                  <div className="text-sm text-teal-100">
                    Security Deposit: {String(property.rental.currency || 'PKR').toUpperCase()} {Number(property.rental.depositMinor || 0).toLocaleString()}
                  </div>
                )}
              </div>

              {/* Contact Card */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg shadow-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Property Details</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <FaMapMarkerAlt className="text-gray-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Location</div>
                      <div className="font-medium text-gray-900">{property.location}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <FaHome className="text-gray-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Property Type</div>
                      <div className="font-medium text-gray-900">{property.type}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <FaUser className="text-gray-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Listed By</div>
                      <div className="font-medium text-gray-900">
                        {property.createdBy?.name || property.createdBy?.email || 'Agent'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      const token = localStorage.getItem('token');
                      if (!token) {
                        navigate('/signin', { state: { redirectTo: `/properties/${property._id}` } });
                        return;
                      }
                      navigate(`/messages?propertyId=${property._id}`);
                    }}
                    className="w-full py-3 px-4 rounded-xl font-semibold border-2 border-teal-600 text-teal-600
                      hover:bg-teal-50 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <FaEnvelope /> Message Seller
                  </button>

                  <button 
                    onClick={() => navigate(`/book/${property._id}`)}
                    className="w-full py-3 px-4 rounded-xl font-semibold text-white
                      bg-gradient-to-r from-orange-500 to-orange-600
                      hover:from-orange-600 hover:to-orange-700
                      shadow-md hover:shadow-lg hover:shadow-orange-500/25
                      transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <FaCalendar /> Book Visit
                  </button>

                  {isRental && String(property.status || 'available') === 'available' && (
                    <button
                      onClick={async () => {
                        const token = localStorage.getItem('token');
                        if (!token) {
                          navigate('/signin', { state: { redirectTo: `/properties/${property._id}` } });
                          return;
                        }

                        const termMonths = window.prompt(
                          `Term months (min ${property?.rental?.minTermMonths || 6})`,
                          String(property?.rental?.minTermMonths || 6)
                        );
                        if (termMonths === null) return;

                        const startDate = window.prompt('Start date (YYYY-MM-DD)', new Date().toISOString().slice(0, 10));
                        if (startDate === null) return;

                        const message = window.prompt('Message to landlord (optional)', '') || '';

                        try {
                          await requestLease({ propertyId: property._id, termMonths, startDate, message });
                          alert('Lease request sent.');
                          navigate('/leases');
                        } catch (e) {
                          alert(e?.data?.message || e?.message || 'Failed to request lease');
                        }
                      }}
                      className="w-full py-3 px-4 rounded-xl font-semibold text-white
                        bg-gradient-to-r from-teal-600 to-teal-700
                        hover:from-teal-700 hover:to-teal-800
                        shadow-md hover:shadow-lg hover:shadow-teal-500/25
                        transition-all duration-200"
                    >
                      Request Lease
                    </button>
                  )}

                  {String(property.status || "available") === "available" ? (
                    <button 
                      onClick={() => navigate(`/book/${property._id}?mode=reserve`)}
                      className="w-full py-3 px-4 rounded-xl font-semibold text-white
                        bg-gradient-to-r from-gray-800 to-gray-900
                        hover:from-gray-900 hover:to-black
                        shadow-md hover:shadow-lg
                        transition-all duration-200"
                    >
                      Reserve Now
                    </button>
                  ) : (
                    <button 
                      disabled
                      className="w-full py-3 px-4 rounded-xl font-semibold text-gray-400 bg-gray-100 
                        cursor-not-allowed capitalize"
                    >
                      {String(property.status || "").toLowerCase()}
                    </button>
                  )}
                </div>
              </div>

              {/* Help Text */}
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-gray-700">Need help?</span> Reserve this property with a small fee to lock it while you decide.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
