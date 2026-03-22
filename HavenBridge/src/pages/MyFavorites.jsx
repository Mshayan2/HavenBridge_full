import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { listMyFavorites } from "../api/favorites";
import { useFavorites } from "../contexts/FavoritesContext";
import { toAssetUrl } from "../utils/url";
import { FaHeart, FaMapMarkerAlt, FaBed, FaBath, FaHome, FaRulerCombined, FaArrowRight, FaCalendarAlt } from "react-icons/fa";

export default function MyFavorites() {
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin", { state: { redirectTo: "/my-favorites" } });
      return;
    }

    const controller = new AbortController();
    let mounted = true;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const out = await listMyFavorites({ page: 1, limit: 50 }, { signal: controller.signal });
        const list = out?.items || [];
        if (!mounted) return;
        setItems(list);
      } catch (e) {
        if (e?.aborted || e?.name === "AbortError") return;
        console.error(e);
        if (!mounted) return;
        setError(e?.data?.message || e?.message || "Failed to load favorites");
        setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [navigate]);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <FaHeart className="text-red-500" />
              </span>
              My Favorites
            </h1>
            <p className="text-gray-500 mt-2">Your saved properties in one place.</p>
          </div>
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-200 
              rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-300 
              transition-all duration-200 font-medium"
          >
            <FaHome className="text-teal-600" />
            Browse Properties
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-6 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && items.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaHeart className="text-4xl text-red-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Favorites Yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Click the heart icon on any property to save it here for quick access later.
            </p>
            <Link
              to="/properties"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700
                text-white font-semibold rounded-xl hover:from-teal-700 hover:to-teal-800
                transition-all duration-300 shadow-lg shadow-teal-500/25"
            >
              <FaHome />
              Browse Properties
            </Link>
          </div>
        )}

        {/* Favorites Grid */}
        {!loading && items.length > 0 && (
          <>
            <div className="mb-4 text-sm text-gray-500">
              {items.length} saved propert{items.length === 1 ? 'y' : 'ies'}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((fav) => {
                const p = fav.property;
                if (!p) return null;
                return (
                  <div
                    key={fav._id}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden 
                      hover:shadow-xl transition-all duration-300 group"
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={toAssetUrl(p.images?.[0])}
                        alt={p.title}
                        className="h-full w-full object-cover transition-transform duration-500 
                          group-hover:scale-110"
                        onError={(e) => {
                          const img = e.currentTarget;
                          if (img.dataset._hadError) return;
                          img.dataset._hadError = "1";
                          img.onerror = null;
                          img.src = "/vite.svg";
                        }}
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Heart Button */}
                      <button
                        type="button"
                        aria-label={isFavorite(p._id) ? "Remove from favorites" : "Add to favorites"}
                        onClick={() => toggleFavorite(p._id)}
                        className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center 
                          justify-center shadow-lg transition-all duration-300 transform 
                          hover:scale-110 ${
                            isFavorite(p._id)
                              ? "bg-red-500 text-white"
                              : "bg-white/90 text-gray-600 hover:bg-white"
                          }`}
                      >
                        <FaHeart className={isFavorite(p._id) ? "animate-pulse" : ""} />
                      </button>

                      {/* Property Type Badge */}
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold
                        bg-teal-500 text-white shadow-lg">
                        {p.propertyType || p.purpose || "Property"}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1 
                        group-hover:text-teal-600 transition-colors">
                        {p.title}
                      </h3>
                      
                      <p className="text-xl font-bold text-teal-600 mb-3">
                        PKR {p.price?.toLocaleString()}
                      </p>

                      {/* Location */}
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                        <FaMapMarkerAlt className="text-teal-500 shrink-0" />
                        <span className="line-clamp-1">{p.location}</span>
                      </div>

                      {/* Features */}
                      <div className="flex items-center gap-4 text-sm text-gray-600 pb-4 border-b border-gray-100">
                        <span className="flex items-center gap-1.5">
                          <FaBed className="text-gray-400" />
                          {p.bedrooms ?? "—"}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <FaBath className="text-gray-400" />
                          {p.bathrooms ?? "—"}
                        </span>
                        {p.area && (
                          <span className="flex items-center gap-1.5">
                            <FaRulerCombined className="text-gray-400" />
                            {p.area} {p.areaUnit || 'sqft'}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="mt-4 flex gap-2">
                        <Link
                          to={`/properties/${p._id}`}
                          className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 
                            border border-gray-200 rounded-xl text-gray-700 font-medium
                            hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                        >
                          View Details
                        </Link>
                        <Link
                          to={`/book/${p._id}`}
                          className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 
                            bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl 
                            font-medium hover:from-teal-700 hover:to-teal-800 
                            transition-all duration-300 shadow-lg shadow-teal-500/25"
                        >
                          <FaCalendarAlt className="text-sm" />
                          Book
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
