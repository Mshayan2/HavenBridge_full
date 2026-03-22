import React, { useEffect, useState } from "react";
import { FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaHeart, FaRegHeart, FaArrowRight } from "react-icons/fa";
import { getProperties } from "../api/properties";
import { useNavigate } from "react-router-dom";
import { toAssetUrl } from "../utils/url";
import { useFavorites } from "../contexts/FavoritesContext";

const FeaturedProperties = () => {
  const [properties, setProperties] = useState([]);
  const [isFallback, setIsFallback] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;
    const fetchProperties = async () => {
      try {
        // Try featured first
        const data = await getProperties({ featured: true, limit: 6, page: 1 }, { signal: controller.signal });
        let items = Array.isArray(data) ? data : (data?.items || []);

        // If very few featured items are returned, prefer recent listings so the
        // homepage appears populated for visitors. Fetch recent and use it when
        // featured count is less than 3 (configurable threshold).
        let fallback = false;
        const FEATURED_MIN = 3;
        if (!items || items.length === 0 || items.length < FEATURED_MIN) {
          const recent = await getProperties({ limit: 6, page: 1 }, { signal: controller.signal });
          const recentItems = Array.isArray(recent) ? recent : (recent?.items || []);

          // If there are enough recent items, use them. Otherwise keep featured.
          if (recentItems && recentItems.length > 0) {
            // Dedupe by _id in case featured returned some items too
            const map = new Map();
            (recentItems || []).forEach((it) => map.set(String(it._id), it));
            (items || []).forEach((it) => map.set(String(it._id), it));
            items = Array.from(map.values());
            fallback = true;
          }
        }

        if (!mounted) return;
        setProperties(items);
        setIsFallback(fallback);
      } catch (error) {
        if (error?.aborted || error?.name === 'AbortError') return;
        console.error("Failed to fetch properties:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProperties();

    // Listen for cross-tab/local updates when a new property is added elsewhere
    const onStorage = (ev) => {
      if (!ev) return;
      if (ev.key === 'properties:updated') {
        fetchProperties();
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      mounted = false;
      controller.abort();
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  if (loading) {
    return (
      <section className="section-padding bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-8 w-64 bg-gray-200 rounded-lg mx-auto mb-4 skeleton" />
            <div className="h-5 w-96 max-w-full bg-gray-200 rounded mx-auto skeleton" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="h-52 bg-gray-200 skeleton" />
                <div className="p-5 space-y-3">
                  <div className="h-6 w-32 bg-gray-200 rounded skeleton" />
                  <div className="h-5 w-48 bg-gray-200 rounded skeleton" />
                  <div className="h-4 w-40 bg-gray-200 rounded skeleton" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-teal-100 text-teal-700 
            text-sm font-semibold mb-4 tracking-wide uppercase">
            {isFallback ? 'Latest Listings' : 'Featured'}
          </span>
          <h2 className="h2 text-gray-900 mb-4">
            {isFallback ? 'Discover Properties' : 'Featured Properties'}
          </h2>
          <p className="lead max-w-2xl mx-auto">
            {isFallback 
              ? 'Browse our latest verified listings handpicked for you'
              : 'Discover our hand-picked selection of premium properties'
            }
          </p>
        </div>

        {properties.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <FaMapMarkerAlt className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">No properties available at the moment.</p>
            <button 
              onClick={() => navigate('/sell')}
              className="mt-4 text-teal-600 font-semibold hover:text-teal-700 transition-colors"
            >
              List your property →
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
              {properties.map((property, index) => (
                <div
                  key={property._id}
                  className="group bg-white rounded-2xl shadow-md hover:shadow-2xl 
                    overflow-hidden transition-all duration-500 hover:-translate-y-2
                    border border-gray-100 hover:border-teal-100"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Image Container */}
                  <div className="h-52 relative overflow-hidden">
                    <img
                      src={toAssetUrl(property.images?.[0])}
                      alt={property.title}
                      className="w-full h-full object-cover transition-transform duration-700 
                        group-hover:scale-110"
                      onError={(e) => {
                        const img = e.currentTarget;
                        if (img.dataset._hadError) return;
                        img.dataset._hadError = '1';
                        img.onerror = null;
                        img.src = '/placeholder.jpg';
                      }}
                    />
                    
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Favorite button */}
                    <button
                      type="button"
                      aria-label={isFavorite(property._id) ? "Remove from favorites" : "Add to favorites"}
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(property._id); }}
                      className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center 
                        shadow-lg transition-all duration-300 hover:scale-110 backdrop-blur-sm ${
                        isFavorite(property._id) 
                          ? "bg-red-500 text-white shadow-red-500/30" 
                          : "bg-white/90 text-gray-600 hover:bg-white hover:text-red-500"
                      }`}
                    >
                      {isFavorite(property._id) ? <FaHeart className="w-4 h-4" /> : <FaRegHeart className="w-4 h-4" />}
                    </button>

                    {/* Badge */}
                    <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold 
                      uppercase tracking-wide shadow-lg backdrop-blur-sm
                      bg-gradient-to-r from-teal-500 to-teal-600 text-white">
                      {isFallback ? 'New' : 'Featured'}
                    </div>

                    {/* Property type badge */}
                    {property.type && (
                      <div className="absolute bottom-4 left-4 px-3 py-1 rounded-lg text-xs font-semibold
                        bg-white/90 text-gray-700 backdrop-blur-sm capitalize">
                        {property.type}
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    {/* Price */}
                    <div className="text-xl font-bold text-teal-700 mb-2">
                      PKR {property.price?.toLocaleString()}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1 
                      group-hover:text-teal-700 transition-colors">
                      {property.title}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-gray-500 mb-4">
                      <FaMapMarkerAlt className="text-teal-500 flex-shrink-0" />
                      <span className="text-sm line-clamp-1">{property.location}</span>
                    </div>

                    {/* Specs */}
                    <div className="grid grid-cols-3 gap-3 py-4 border-t border-gray-100">
                      <div className="text-center group/spec">
                        <div className="w-9 h-9 mx-auto mb-1.5 rounded-lg bg-teal-50 
                          flex items-center justify-center 
                          group-hover/spec:bg-teal-100 transition-colors">
                          <FaBed className="text-teal-600 w-4 h-4" />
                        </div>
                        <div className="font-semibold text-gray-900">{property.bedrooms || '—'}</div>
                        <div className="text-xs text-gray-500">Beds</div>
                      </div>

                      <div className="text-center group/spec">
                        <div className="w-9 h-9 mx-auto mb-1.5 rounded-lg bg-teal-50 
                          flex items-center justify-center 
                          group-hover/spec:bg-teal-100 transition-colors">
                          <FaBath className="text-teal-600 w-4 h-4" />
                        </div>
                        <div className="font-semibold text-gray-900">{property.bathrooms || '—'}</div>
                        <div className="text-xs text-gray-500">Baths</div>
                      </div>

                      <div className="text-center group/spec">
                        <div className="w-9 h-9 mx-auto mb-1.5 rounded-lg bg-teal-50 
                          flex items-center justify-center 
                          group-hover/spec:bg-teal-100 transition-colors">
                          <FaRulerCombined className="text-teal-600 w-4 h-4" />
                        </div>
                        <div className="font-semibold text-gray-900">{property.area || '—'}</div>
                        <div className="text-xs text-gray-500">Sq Ft</div>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <button 
                      onClick={() => navigate(`/properties/${property._id}`)} 
                      className="mt-4 w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 
                        text-white font-semibold rounded-xl 
                        hover:from-orange-600 hover:to-orange-700
                        shadow-md hover:shadow-lg hover:shadow-orange-500/25
                        transition-all duration-300 flex items-center justify-center gap-2
                        active:scale-[0.98]"
                    >
                      View Details
                      <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center mt-12">
              <button
                onClick={() => navigate('/properties')}
                className="inline-flex items-center gap-3 px-8 py-4 
                  border-2 border-teal-600 text-teal-700 font-semibold rounded-xl
                  hover:bg-teal-50 hover:border-teal-700
                  transition-all duration-300 group"
              >
                View All Properties
                <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default FeaturedProperties;
