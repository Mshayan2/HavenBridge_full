import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyProperties } from "../api/properties";
import { toAssetUrl } from "../utils/url";
import { 
  FaHome, FaPlus, FaEye, FaMapMarkerAlt, FaClock, FaCheckCircle, 
  FaTimesCircle, FaExclamationTriangle, FaBed, FaBath, FaRulerCombined,
  FaSync
} from "react-icons/fa";

export default function MyListings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  const loadData = async () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      navigate("/signin", { state: { redirectTo: "/my-listings" } });
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await getMyProperties({ page: 1, limit: 24 });
      const list = Array.isArray(data) ? data : (data?.items || []);
      setItems(list);
    } catch (e) {
      console.error("MyListings load error:", e);
      const msg = e?.data?.message || e?.message || "Failed to load your listings";
      setError(msg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [navigate]);

  const getStatusConfig = (approval) => {
    const status = approval?.status || "pending";
    const configs = {
      approved: {
        bg: "bg-green-100",
        text: "text-green-800",
        border: "border-green-200",
        icon: FaCheckCircle,
        label: "Approved"
      },
      rejected: {
        bg: "bg-red-100",
        text: "text-red-800",
        border: "border-red-200",
        icon: FaTimesCircle,
        label: "Rejected"
      },
      pending: {
        bg: "bg-amber-100",
        text: "text-amber-800",
        border: "border-amber-200",
        icon: FaClock,
        label: "Pending Review"
      }
    };
    return configs[status] || configs.pending;
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                <FaHome className="text-teal-600" />
              </span>
              My Listings
            </h1>
            <p className="text-gray-500 mt-2">Properties you've submitted or listed for sale.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 
                rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-300 
                transition-all duration-200 font-medium disabled:opacity-50"
            >
              <FaSync className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={() => navigate("/sell", { state: { fromHeader: true } })}
              className="inline-flex items-center gap-2 px-5 py-2.5 
                bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl 
                font-semibold hover:from-orange-600 hover:to-orange-700
                transition-all duration-300 shadow-lg shadow-orange-500/25"
            >
              <FaPlus />
              List a Property
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 
            flex items-start gap-3">
            <FaExclamationTriangle className="text-red-500 shrink-0 mt-0.5" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-44 bg-gray-200" />
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
        {!loading && items.length === 0 && !error && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaHome className="text-4xl text-teal-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Listings Yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              You haven't listed any properties. Start by submitting your first listing.
            </p>
            <button
              onClick={() => navigate("/sell", { state: { fromHeader: true } })}
              className="inline-flex items-center gap-2 px-6 py-3 
                bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl 
                font-semibold hover:from-orange-600 hover:to-orange-700
                transition-all duration-300 shadow-lg shadow-orange-500/25"
            >
              <FaPlus />
              Sell a Property
            </button>
          </div>
        )}

        {/* Listings Grid */}
        {!loading && items.length > 0 && (
          <>
            <div className="mb-4 text-sm text-gray-500">
              {items.length} listing{items.length === 1 ? '' : 's'}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((p) => {
                const img = toAssetUrl(p.images?.[0]) || "/vite.svg";
                const statusConfig = getStatusConfig(p?.approval);
                const StatusIcon = statusConfig.icon;
                const isApproved = p?.approval?.status === "approved";

                return (
                  <div
                    key={p._id}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden 
                      hover:shadow-xl transition-all duration-300 group"
                  >
                    {/* Image */}
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={img}
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
                      {/* Status Badge */}
                      <div className={`absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs 
                        font-semibold flex items-center gap-1.5 ${statusConfig.bg} ${statusConfig.text} 
                        border ${statusConfig.border}`}>
                        <StatusIcon className="text-xs" />
                        {statusConfig.label}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1 
                        group-hover:text-teal-600 transition-colors">
                        {p.title || "Untitled Property"}
                      </h3>

                      <p className="text-xl font-bold text-teal-600 mb-3">
                        {p.price ? `PKR ${Number(p.price).toLocaleString()}` : "Price not set"}
                      </p>

                      {/* Location */}
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                        <FaMapMarkerAlt className="text-teal-500 shrink-0" />
                        <span className="line-clamp-1">{p.location || p.address || "Location not set"}</span>
                      </div>

                      {/* Features */}
                      <div className="flex items-center gap-4 text-sm text-gray-600 pb-4 border-b border-gray-100">
                        {p.bedrooms && (
                          <span className="flex items-center gap-1.5">
                            <FaBed className="text-gray-400" />
                            {p.bedrooms}
                          </span>
                        )}
                        {p.bathrooms && (
                          <span className="flex items-center gap-1.5">
                            <FaBath className="text-gray-400" />
                            {p.bathrooms}
                          </span>
                        )}
                        {p.area && (
                          <span className="flex items-center gap-1.5">
                            <FaRulerCombined className="text-gray-400" />
                            {p.area} {p.areaUnit || 'sqft'}
                          </span>
                        )}
                      </div>

                      {/* Rejection Reason */}
                      {p?.approval?.status === "rejected" && p?.approval?.reason && (
                        <div className="mt-3 bg-red-50 rounded-lg p-3 text-xs text-red-700">
                          <span className="font-medium">Rejection reason:</span> {p.approval.reason}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="mt-4">
                        {isApproved ? (
                          <Link
                            to={`/properties/${p._id}`}
                            className="w-full inline-flex items-center justify-center gap-2 py-2.5 
                              bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl 
                              font-medium hover:from-teal-700 hover:to-teal-800 
                              transition-all duration-300 shadow-lg shadow-teal-500/25"
                          >
                            <FaEye />
                            View Public Listing
                          </Link>
                        ) : (
                          <div className="w-full py-2.5 bg-gray-100 text-gray-500 rounded-xl 
                            text-center text-sm font-medium flex items-center justify-center gap-2">
                            <FaClock />
                            {p?.approval?.status === "rejected" ? "Resubmission Required" : "Awaiting Approval"}
                          </div>
                        )}
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
