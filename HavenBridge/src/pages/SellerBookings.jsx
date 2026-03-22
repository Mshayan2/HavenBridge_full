import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import { 
  FaCalendarCheck, FaSync, FaHome, FaUser, FaClock, FaEnvelope, FaPhone,
  FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaStickyNote, FaInbox
} from "react-icons/fa";

export default function SellerBookings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectState, setRejectState] = useState({ open: false, bookingId: null, reason: "" });

  const load = useCallback(async (signal) => {
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.get("/bookings/my-properties", { signal });
      setBookings(Array.isArray(res?.data) ? res.data : []);
    } catch (e) {
      if (e?.aborted || e?.name === "AbortError") return;
      console.error(e);
      const msg = e?.data?.message || e?.message || "Failed to load seller bookings";
      setError(msg);
      if (String(msg).toLowerCase().includes("not authorized") || String(msg).includes("401")) {
        navigate("/signin");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const getStatusConfig = (status) => {
    const configs = {
      pending: { bg: "bg-amber-100", text: "text-amber-800", icon: FaClock },
      confirmed: { bg: "bg-green-100", text: "text-green-800", icon: FaCheckCircle },
      rejected: { bg: "bg-red-100", text: "text-red-800", icon: FaTimesCircle },
      completed: { bg: "bg-blue-100", text: "text-blue-800", icon: FaCheckCircle },
    };
    return configs[status] || { bg: "bg-gray-100", text: "text-gray-700", icon: FaClock };
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                <FaCalendarCheck className="text-teal-600" />
              </span>
              Booking Requests
            </h1>
            <p className="text-gray-500 mt-2">Manage booking requests for your listed properties.</p>
          </div>
          <button
            onClick={() => load()}
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

        {/* Loading */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaInbox className="text-4xl text-teal-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Booking Requests</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              You haven't received any booking requests for your properties yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => {
              const statusConfig = getStatusConfig(b.status);
              const StatusIcon = statusConfig.icon;
              return (
                <div key={b._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
                          <FaHome className="text-teal-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {b.property?.title || "(Property)"}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <FaClock className="text-gray-400 text-xs" />
                            <span className="text-sm text-gray-600">
                              {b.bookingDate ? new Date(b.bookingDate).toLocaleString() : "—"}
                            </span>
                          </div>
                          <span className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold 
                            ${statusConfig.bg} ${statusConfig.text}`}>
                            <StatusIcon className="text-xs" />
                            {String(b.status || "").toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col items-end gap-3">
                        {b.property?._id && (
                          <Link
                            to={`/properties/${b.property._id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 
                              border border-gray-200 rounded-lg text-sm font-medium text-gray-700
                              hover:bg-gray-50 transition-colors"
                          >
                            <FaHome />
                            View Property
                          </Link>
                        )}

                        {b.status === "pending" && (
                          <div className="flex items-center gap-2">
                            <button
                              disabled={actionLoading}
                              onClick={async () => {
                                if (!window.confirm("Confirm this booking?")) return;
                                setActionLoading(true);
                                try {
                                  await apiClient.put(`/bookings/${b._id}/respond`, { action: "confirm" });
                                  await load();
                                } catch (e) {
                                  console.error(e);
                                  alert(e?.data?.message || e?.message || "Failed to confirm booking");
                                } finally {
                                  setActionLoading(false);
                                }
                              }}
                              className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold
                                hover:bg-green-700 transition-colors disabled:opacity-50
                                flex items-center gap-2"
                            >
                              <FaCheckCircle />
                              Accept
                            </button>

                            <button
                              disabled={actionLoading}
                              onClick={() => setRejectState({ open: true, bookingId: b._id, reason: "" })}
                              className="px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-semibold
                                hover:bg-red-50 transition-colors disabled:opacity-50
                                flex items-center gap-2"
                            >
                              <FaTimesCircle />
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="mt-5 pt-5 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                          <FaUser className="text-xs" /> Buyer
                        </div>
                        <div className="font-medium text-gray-800 text-sm">
                          {b.customer?.name || "—"}
                        </div>
                      </div>
                      {b.customer?.email && (
                        <div className="bg-gray-50 rounded-xl p-3">
                          <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                            <FaEnvelope className="text-xs" /> Email
                          </div>
                          <div className="font-medium text-gray-800 text-sm truncate">
                            {b.customer.email}
                          </div>
                        </div>
                      )}
                      {b.contactPhone && (
                        <div className="bg-gray-50 rounded-xl p-3">
                          <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                            <FaPhone className="text-xs" /> Phone
                          </div>
                          <div className="font-medium text-gray-800 text-sm">
                            {b.contactPhone}
                          </div>
                        </div>
                      )}
                      {b.notes && (
                        <div className="bg-amber-50 rounded-xl p-3 sm:col-span-2 lg:col-span-1">
                          <div className="text-xs text-amber-600 mb-1 flex items-center gap-1">
                            <FaStickyNote className="text-xs" /> Notes
                          </div>
                          <div className="text-sm text-gray-700 line-clamp-2">
                            {b.notes}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Reject Modal */}
        {rejectState.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-fade-in">
              <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <FaTimesCircle className="text-red-600" />
                </span>
                Reject Booking
              </h3>
              <p className="text-sm text-gray-500 mb-5">
                Provide a reason (optional) that will be sent to the buyer.
              </p>
              <textarea
                value={rejectState.reason}
                onChange={(e) => setRejectState({ ...rejectState, reason: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-5
                  focus:ring-2 focus:ring-red-500/20 focus:border-red-500 
                  transition-all duration-200 outline-none resize-none"
                rows={4}
                placeholder="Reason for rejection (optional)"
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setRejectState({ open: false, bookingId: null, reason: "" })}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium
                    hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setActionLoading(true);
                    try {
                      await apiClient.put(`/bookings/${rejectState.bookingId}/respond`, { 
                        action: "reject", 
                        notes: rejectState.reason 
                      });
                      setRejectState({ open: false, bookingId: null, reason: "" });
                      await load();
                    } catch (e) {
                      console.error(e);
                      alert(e?.data?.message || e?.message || "Failed to reject booking");
                    } finally {
                      setActionLoading(false);
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-semibold
                    hover:bg-red-700 transition-colors disabled:opacity-50"
                  disabled={actionLoading}
                >
                  {actionLoading ? "Rejecting..." : "Reject Booking"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Tip */}
        <div className="mt-8 text-center text-sm text-gray-400">
          Tip: Admin can also confirm/assign staff from the Admin Bookings page.
        </div>
      </div>
    </div>
  );
}
