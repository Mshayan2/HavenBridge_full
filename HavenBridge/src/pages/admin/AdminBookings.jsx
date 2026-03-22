import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminGetBookings, adminUpdateBooking } from "../../api/admin";
import { 
  FaCalendarCheck, FaSync, FaExclamationTriangle, FaUser, FaHome, FaClock,
  FaPhone, FaUsers, FaCheckCircle, FaTimesCircle, FaBan, FaSearch, FaInbox
} from "react-icons/fa";

const STATUS_OPTIONS = ["pending", "confirmed", "rejected", "cancelled", "completed"];

const getStatusConfig = (status) => {
  const configs = {
    pending: { bg: "bg-amber-100", text: "text-amber-700", icon: FaClock },
    confirmed: { bg: "bg-green-100", text: "text-green-700", icon: FaCheckCircle },
    rejected: { bg: "bg-red-100", text: "text-red-700", icon: FaTimesCircle },
    cancelled: { bg: "bg-gray-100", text: "text-gray-700", icon: FaBan },
    completed: { bg: "bg-blue-100", text: "text-blue-700", icon: FaCheckCircle },
  };
  return configs[status] || configs.pending;
};

export default function AdminBookings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const me = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await adminGetBookings();
      const list = Array.isArray(res?.data) ? res.data : (res?.data?.bookings || []);
      setBookings(Array.isArray(list) ? list : []);
    } catch (e) {
      const msg = e?.message || "Failed to load bookings.";
      setError(msg);
      if (String(msg).includes("401") || String(msg).toLowerCase().includes("unauthorized")) {
        navigate("/signin");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!me || me?.role !== "admin") navigate("/signin");
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onChangeStatus(bookingId, status) {
    setError("");
    try {
      await adminUpdateBooking(bookingId, { status });
      await load();
    } catch (e) {
      setError(e?.message || "Failed to update booking.");
    }
  }

  const filteredBookings = bookings.filter(b => {
    const term = searchTerm.toLowerCase();
    return (b.property?.title || "").toLowerCase().includes(term) || 
           (b.customer?.email || "").toLowerCase().includes(term) ||
           (b.customer?.name || "").toLowerCase().includes(term);
  });

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <FaCalendarCheck className="text-blue-600" />
              </span>
              Admin — Bookings
            </h1>
            <p className="text-gray-500 mt-2">View and manage all booking requests.</p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 
              bg-gray-900 text-white rounded-xl font-medium
              hover:bg-gray-800 transition-all duration-200
              disabled:opacity-50"
          >
            <FaSync className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 
            flex items-start gap-3 animate-fade-in">
            <FaExclamationTriangle className="text-red-500 shrink-0 mt-0.5" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by property or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl
                focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                transition-all duration-200 outline-none"
            />
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaInbox className="text-4xl text-blue-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Bookings Found</h3>
            <p className="text-gray-500">
              {searchTerm ? "Try a different search term." : "No bookings submitted yet."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredBookings.map((b) => {
                    const statusConfig = getStatusConfig(b.status);
                    return (
                      <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                              <FaHome className="text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 line-clamp-1">
                                {b?.property?.title || b?.propertyTitle || "—"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {b?.bookingType === "reserve" ? "Reservation" : "Visit"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                              <FaUser className="text-gray-500" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {b?.customer?.name || "—"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {b?.customer?.email || "—"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <FaClock className="text-gray-400 text-xs" />
                              {b?.bookingDate ? new Date(b.bookingDate).toLocaleString() : "—"}
                              {b?.visitTime ? ` at ${b.visitTime}` : ""}
                            </div>
                            {b?.contactPhone && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <FaPhone className="text-gray-400 text-xs" />
                                {b.contactPhone}
                              </div>
                            )}
                            {b?.guests && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <FaUsers className="text-gray-400 text-xs" />
                                {b.guests} guest{b.guests !== 1 ? "s" : ""}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            className={`px-3 py-2 border rounded-lg text-sm font-medium
                              focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                              transition-all duration-200 outline-none cursor-pointer
                              ${statusConfig.bg} ${statusConfig.text} border-transparent`}
                            value={b.status || "pending"}
                            onChange={(e) => onChangeStatus(b._id, e.target.value)}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer Stats */}
        <div className="mt-6 text-center text-sm text-gray-400">
          {filteredBookings.length} booking{filteredBookings.length !== 1 ? "s" : ""} total
        </div>
      </div>
    </div>
  );
}
