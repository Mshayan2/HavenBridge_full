import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { getProperties, getPropertyFacets } from "../api/properties";
import { FaBed, FaBath, FaMapMarkerAlt, FaHeart, FaRegHeart, FaSearch, FaFilter, FaList, FaMap, FaSave, FaTimes, FaRulerCombined, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { toAssetUrl } from "../utils/url";
import { useFavorites } from "../contexts/FavoritesContext";
import { createSavedSearch } from "../api/savedSearches";
import PropertyMap from "../components/PropertyMap";

const PropertiesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pageMeta, setPageMeta] = useState({ page: 1, pages: 1, total: 0, limit: 12 });
  const [liveQuery, setLiveQuery] = useState(() => searchParams.get('q') || '');
  const [facets, setFacets] = useState(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();

  const filtersObj = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams]);
  const currentSort = String(searchParams.get('sort') || 'newest');
  const viewMode = String(searchParams.get('view') || 'list');
  const currentListing = String(searchParams.get('listing') || '').trim();
  const currentTypes = String(searchParams.get('types') || searchParams.get('type') || '').trim();
  const currentStatus = String(searchParams.get('status') || '').trim();
  const currentFeatures = String(searchParams.get('features') || '').trim();
  const currentFeaturesMode = String(searchParams.get('featuresMode') || 'any');

  const activeFilterCount = Object.entries(filtersObj)
    .filter(([k, v]) => !['page', 'limit', 'view', 'sort'].includes(k) && v !== '' && v != null)
    .length;

  function updateParam(next) {
    const params = new URLSearchParams(Object.fromEntries(searchParams.entries()));
    Object.entries(next || {}).forEach(([k, v]) => {
      if (v === undefined || v === null || String(v).trim() === '') params.delete(k);
      else params.set(k, String(v));
    });
    params.delete('page');
    setSearchParams(params, { replace: true });
  }

  function setView(next) {
    const v = next === 'map' ? 'map' : 'list';
    updateParam({ view: v });
  }

  function clearAllFilters() {
    const params = new URLSearchParams();
    setLiveQuery('');
    setSearchParams(params, { replace: true });
  }

  async function saveThisSearch() {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.assign(`/signin`);
      return;
    }

    const name = window.prompt("Name this saved search:", "My search");
    if (!name) return;

    const frequency = window.prompt("Alert frequency: instant | daily | weekly", "daily") || "daily";

    const query = Object.fromEntries(searchParams.entries());
    delete query.page;
    delete query.limit;

    try {
      await createSavedSearch({ name, frequency, query, active: true });
      alert("Saved search created. You'll get notifications for new matches.");
    } catch (e) {
      alert(e?.data?.message || e?.message || "Failed to create saved search");
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;

    const fetchProperties = async () => {
      try {
        setError("");
        const filters = Object.fromEntries(searchParams.entries());
        const data = await getProperties(filters, { signal: controller.signal });
        const items = Array.isArray(data) ? data : (data?.items || []);
        if (!mounted) return;
        setProperties(Array.isArray(items) ? items : []);

        if (!Array.isArray(data)) {
          setPageMeta({
            page: Number(data?.page || 1),
            pages: Number(data?.pages || 1),
            total: Number(data?.total || items.length || 0),
            limit: Number(data?.limit || 12),
          });
        } else {
          setPageMeta({ page: 1, pages: 1, total: items.length, limit: items.length || 12 });
        }
      } catch (error) {
        if (error?.aborted || error?.name === 'AbortError') return;
        console.error("Failed to fetch properties:", error);
        const status = error?.status || error?.response?.status || null;
        const body = error?.data || error?.response?.data || null;
        const msg = (body && (body.message || JSON.stringify(body))) || error?.message || "Failed to fetch properties.";
        if (!mounted) return;
        setProperties([]);
        setError(status ? `${status} — ${msg}` : msg);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProperties();

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
  }, [searchParams]);

  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;

    (async () => {
      try {
        const data = await getPropertyFacets(Object.fromEntries(searchParams.entries()), { signal: controller.signal });
        if (!mounted) return;
        setFacets(data || null);
      } catch (e) {
        if (e?.aborted || e?.name === 'AbortError') return;
        if (!mounted) return;
        setFacets(null);
      }
    })();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [searchParams]);

  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams(Object.fromEntries(searchParams.entries()));
      if (liveQuery && liveQuery.trim()) {
        params.set('q', liveQuery.trim());
      } else {
        params.delete('q');
      }
      params.delete('page');
      setSearchParams(params, { replace: true });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveQuery]);

  const inputClasses = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all duration-200";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="h-10 w-48 bg-gray-200 rounded-lg mb-2 animate-pulse" />
          <div className="h-6 w-64 bg-gray-200 rounded mb-8 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <div className="h-48 bg-gray-200 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-6 w-1/2 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
                  <div className="flex gap-4">
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="h-10 w-full bg-gray-200 rounded-xl animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Search by title, location, keywords..."
                value={liveQuery}
                onChange={(e) => setLiveQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3
                  text-gray-800 placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white
                  transition-all duration-200"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <select
                value={currentSort}
                onChange={(e) => updateParam({ sort: e.target.value })}
                className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-700 
                  focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500
                  transition-all duration-200 cursor-pointer"
                aria-label="Sort"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="area_desc">Area: Large → Small</option>
                <option value="beds_desc">Most Bedrooms</option>
              </select>

              {/* View Toggle */}
              <div className="hidden sm:flex bg-gray-100 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setView('list')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2
                    ${viewMode === 'list' 
                      ? 'bg-white text-teal-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'}`}
                >
                  <FaList /> List
                </button>
                <button
                  type="button"
                  onClick={() => setView('map')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2
                    ${viewMode === 'map' 
                      ? 'bg-white text-teal-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'}`}
                >
                  <FaMap /> Map
                </button>
              </div>

              {/* Filter Toggle (Mobile) */}
              <button
                type="button"
                className="lg:hidden flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 
                  rounded-xl text-gray-700 hover:border-teal-500 transition-all duration-200"
                onClick={() => setIsFiltersOpen((v) => !v)}
              >
                <FaFilter />
                Filters
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <button 
                onClick={saveThisSearch}
                className="hidden sm:flex items-center gap-2 px-4 py-3 bg-teal-50 text-teal-700 
                  rounded-xl font-medium hover:bg-teal-100 transition-all duration-200"
              >
                <FaSave /> Save
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Results Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Properties</h1>
          <p className="text-gray-600">
            {pageMeta.total ? (
              <span><span className="font-semibold text-teal-600">{pageMeta.total.toLocaleString()}</span> properties found</span>
            ) : (
              <span>Browse listings and find your perfect home</span>
            )}
          </p>

          {/* Active Filter Chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {Object.entries(filtersObj)
                .filter(([k, v]) => !['page', 'limit', 'view', 'sort'].includes(k) && v !== '' && v != null)
                .slice(0, 8)
                .map(([k, v]) => (
                  <button
                    key={`${k}:${v}`}
                    type="button"
                    onClick={() => updateParam({ [k]: '' })}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 
                      text-teal-700 text-sm font-medium hover:bg-teal-100 transition-colors"
                  >
                    <span className="text-teal-500">{k}:</span> {String(v)}
                    <FaTimes className="text-xs" />
                  </button>
                ))}
              <button
                type="button"
                onClick={clearAllFilters}
                className="px-3 py-1.5 rounded-full bg-red-50 text-red-600 text-sm font-medium
                  hover:bg-red-100 transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className={`lg:block ${isFiltersOpen ? 'block' : 'hidden'} lg:col-span-1`}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-28 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <FaFilter className="text-teal-600" /> Filters
                </h2>
                <button 
                  type="button" 
                  className="lg:hidden text-gray-500 hover:text-gray-700" 
                  onClick={() => setIsFiltersOpen(false)}
                >
                  <FaTimes />
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                <input
                  value={String(searchParams.get('location') || '')}
                  onChange={(e) => updateParam({ location: e.target.value })}
                  className={inputClasses}
                  placeholder="City or area"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Listing Type</label>
                <select
                  value={currentListing}
                  onChange={(e) => updateParam({ listing: e.target.value })}
                  className={inputClasses}
                >
                  <option value="">All Listings</option>
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Property Type</label>
                <select
                  value={currentTypes}
                  onChange={(e) => updateParam({ types: e.target.value })}
                  className={inputClasses}
                >
                  <option value="">All Types</option>
                  <option value="house">House</option>
                  <option value="villa">Villa</option>
                  <option value="apartment">Apartment</option>
                  <option value="plot">Plot</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  value={currentStatus}
                  onChange={(e) => updateParam({ status: e.target.value })}
                  className={inputClasses}
                >
                  <option value="">Any Status</option>
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="sold">Sold</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price Range</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={String(searchParams.get('minPrice') || '')}
                    onChange={(e) => updateParam({ minPrice: e.target.value })}
                    className={inputClasses}
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    value={String(searchParams.get('maxPrice') || '')}
                    onChange={(e) => updateParam({ maxPrice: e.target.value })}
                    className={inputClasses}
                    placeholder="Max"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Area (sq ft)</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={String(searchParams.get('minArea') || '')}
                    onChange={(e) => updateParam({ minArea: e.target.value })}
                    className={inputClasses}
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    value={String(searchParams.get('maxArea') || '')}
                    onChange={(e) => updateParam({ maxArea: e.target.value })}
                    className={inputClasses}
                    placeholder="Max"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Bedrooms & Bathrooms</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={String(searchParams.get('minBedrooms') || searchParams.get('bedrooms') || '')}
                    onChange={(e) => updateParam({ minBedrooms: e.target.value, bedrooms: '' })}
                    className={inputClasses}
                    placeholder="Min Beds"
                  />
                  <input
                    type="number"
                    value={String(searchParams.get('minBathrooms') || searchParams.get('bathrooms') || '')}
                    onChange={(e) => updateParam({ minBathrooms: e.target.value, bathrooms: '' })}
                    className={inputClasses}
                    placeholder="Min Baths"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Features</label>
                <input
                  value={currentFeatures}
                  onChange={(e) => updateParam({ features: e.target.value })}
                  className={inputClasses}
                  placeholder="pool, garden, parking..."
                />
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-sm text-gray-600">Match:</span>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => updateParam({ featuresMode: 'any' })}
                      className={`px-3 py-1 rounded-md text-sm transition-all ${
                        currentFeaturesMode === 'any' ? 'bg-white shadow-sm text-teal-600' : 'text-gray-600'
                      }`}
                    >
                      Any
                    </button>
                    <button
                      type="button"
                      onClick={() => updateParam({ featuresMode: 'all' })}
                      className={`px-3 py-1 rounded-md text-sm transition-all ${
                        currentFeaturesMode === 'all' ? 'bg-white shadow-sm text-teal-600' : 'text-gray-600'
                      }`}
                    >
                      All
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <section className="lg:col-span-3">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FaTimes className="text-xs text-red-600" />
                </div>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {viewMode === 'map' ? (
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                  <PropertyMap
                    properties={properties}
                    onBoundsChange={({ minLat, minLng, maxLat, maxLng }) => {
                      const bbox = `${minLng},${minLat},${maxLng},${maxLat}`;
                      updateParam({ bbox });
                    }}
                    className="h-[600px]"
                  />
                </div>
                <p className="text-sm text-gray-500 text-center">
                  Drag and zoom the map to refine results
                </p>
              </div>
            ) : (
              <>
                {properties.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                      <FaSearch className="text-gray-400 text-2xl" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No properties found</h3>
                    <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
                    <button
                      onClick={clearAllFilters}
                      className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-xl
                        font-semibold hover:bg-teal-700 transition-colors"
                    >
                      Clear All Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {properties.map((property, index) => (
                      <div 
                        key={property._id} 
                        className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm
                          hover:shadow-xl hover:border-teal-100 transition-all duration-300
                          animate-fade-in-up"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="relative">
                          <img
                            src={toAssetUrl(property.images?.[0])}
                            alt={property.title}
                            className="h-52 w-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              const img = e.currentTarget;
                              if (img.dataset._hadError) return;
                              img.dataset._hadError = '1';
                              img.onerror = null;
                              img.src = '/vite.svg';
                            }}
                          />
                          
                          {/* Overlay gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          {/* Favorite button */}
                          <button
                            type="button"
                            aria-label={isFavorite(property._id) ? "Remove from favorites" : "Add to favorites"}
                            onClick={(e) => { e.preventDefault(); toggleFavorite(property._id); }}
                            className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center 
                              shadow-lg transition-all duration-200 hover:scale-110 ${
                              isFavorite(property._id) 
                                ? "bg-red-500 text-white" 
                                : "bg-white/90 backdrop-blur-sm text-gray-600 hover:text-red-500"
                            }`}
                          >
                            {isFavorite(property._id) ? <FaHeart /> : <FaRegHeart />}
                          </button>

                          {/* Status badge */}
                          <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold uppercase
                            ${property.status === 'available' 
                              ? 'bg-green-500 text-white' 
                              : property.status === 'reserved'
                              ? 'bg-orange-500 text-white'
                              : 'bg-gray-500 text-white'}`}
                          >
                            {property.status || 'Available'}
                          </div>
                        </div>

                        <div className="p-5">
                          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 
                            group-hover:text-teal-600 transition-colors">
                            {property.title}
                          </h3>

                          <p className="text-xl font-bold text-teal-600 mb-3">
                            {property?.rental?.enabled
                              ? `${String(property.rental.currency || 'PKR').toUpperCase()} ${Number(property.rental.monthlyRentMinor || 0).toLocaleString()}`
                              : `PKR ${property.price?.toLocaleString?.() || property.price}`}
                            {property?.rental?.enabled && (
                              <span className="text-sm font-normal text-gray-500"> / month</span>
                            )}
                          </p>

                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                            <FaMapMarkerAlt className="text-teal-500" />
                            <span className="line-clamp-1">{property.location}</span>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-5 pb-5 border-b border-gray-100">
                            <span className="flex items-center gap-1.5">
                              <FaBed className="text-gray-400" /> {property.bedrooms || '—'}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <FaBath className="text-gray-400" /> {property.bathrooms || '—'}
                            </span>
                            {property.area && (
                              <span className="flex items-center gap-1.5">
                                <FaRulerCombined className="text-gray-400" /> {property.area}
                              </span>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Link 
                              to={`/properties/${property._id}`} 
                              className="flex-1 text-center py-2.5 px-4 rounded-xl font-semibold
                                border-2 border-teal-600 text-teal-600 hover:bg-teal-50 transition-colors"
                            >
                              Details
                            </Link>
                            {String(property.status || "available") === "available" ? (
                              <Link 
                                to={`/book/${property._id}?mode=reserve`} 
                                className="flex-1 text-center py-2.5 px-4 rounded-xl font-semibold text-white
                                  bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800
                                  shadow-md hover:shadow-lg transition-all"
                              >
                                Reserve
                              </Link>
                            ) : (
                              <span className="flex-1 text-center py-2.5 px-4 rounded-xl font-medium
                                bg-gray-100 text-gray-500 cursor-not-allowed capitalize">
                                {String(property.status || "").toLowerCase()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Pagination */}
            {pageMeta.pages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <Link
                  to={`/properties?${new URLSearchParams({ 
                    ...Object.fromEntries(searchParams.entries()), 
                    page: String(Math.max(1, pageMeta.page - 1)) 
                  }).toString()}`}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all
                    ${pageMeta.page <= 1 
                      ? "pointer-events-none opacity-50 bg-gray-100 text-gray-400" 
                      : "bg-white border border-gray-200 text-gray-700 hover:border-teal-500 hover:text-teal-600"}`}
                >
                  <FaChevronLeft className="text-xs" /> Previous
                </Link>
                
                <div className="px-5 py-2.5 bg-teal-50 text-teal-700 rounded-xl font-medium">
                  Page <span className="font-bold">{pageMeta.page}</span> of <span className="font-bold">{pageMeta.pages}</span>
                </div>
                
                <Link
                  to={`/properties?${new URLSearchParams({ 
                    ...Object.fromEntries(searchParams.entries()), 
                    page: String(Math.min(pageMeta.pages, pageMeta.page + 1)) 
                  }).toString()}`}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all
                    ${pageMeta.page >= pageMeta.pages 
                      ? "pointer-events-none opacity-50 bg-gray-100 text-gray-400" 
                      : "bg-white border border-gray-200 text-gray-700 hover:border-teal-500 hover:text-teal-600"}`}
                >
                  Next <FaChevronRight className="text-xs" />
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPage;
