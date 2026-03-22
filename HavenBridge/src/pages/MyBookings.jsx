import React, { useCallback, useEffect, useState } from "react";
import { getMyBookings, cancelMyBooking } from "../api/bookings";
import { getPaymentsStatus } from "../api/payments";
import { getMyNotifications, markNotificationRead } from "../api/notifications";
import { Link, useNavigate } from "react-router-dom";
import { 
  FaCalendarAlt, FaCreditCard, FaTimes, FaHome, FaEye, FaReply, 
  FaPhone, FaStickyNote, FaClock, FaExclamationTriangle, FaInbox,
  FaMapMarkerAlt, FaCheckCircle
} from "react-icons/fa";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [stripeEnabled, setStripeEnabled] = useState(null);

  const formatDateTime = (value) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString();
  };

  const prettyStatus = (status) => {
    if (!status) return "—";
    const s = String(status);
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const getStatusStyles = (status) => {
    const s = String(status || "").toLowerCase();
    const styles = {
      pending: "bg-amber-100 text-amber-800 border-amber-200",
      confirmed: "bg-green-100 text-green-800 border-green-200",
      approved: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
      cancelled: "bg-gray-100 text-gray-600 border-gray-200",
      completed: "bg-blue-100 text-blue-800 border-blue-200",
    };
    return styles[s] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMyBookings();
      setBookings(Array.isArray(data) ? data : []);
      try {
        const status = await getPaymentsStatus();
        setStripeEnabled(Boolean(status?.stripeConfigured));
      } catch {
        setStripeEnabled(false);
      }
    } catch (err) {
      const msg = err?.data?.message || err?.message || "Failed to load bookings";
      setError(msg);
      if (err?.status === 401 || String(msg).toLowerCase().includes("not authorized")) {
        navigate("/signin");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    let mounted = true;
    let inFlight = false;
    const check = async () => {
      if (inFlight) return;
      inFlight = true;
      try {
        const notes = await getMyNotifications({ includeRead: false, limit: 10 });
        if (!mounted) return;
        if (Array.isArray(notes) && notes.length > 0) {
          const bookingRelatedTypes = new Set([
            "booking_seen", "booking_responded", "booking_status_changed",
            "booking_created", "payment_paid",
          ]);
          const interesting = notes.filter((n) => bookingRelatedTypes.has(n?.type));
          if (interesting.length > 0) {
            await load();
            await Promise.all(
              interesting.filter((n) => n?._id).map((n) =>
                markNotificationRead(n._id).catch(() => null)
              )
            );
          }
        }
      } catch { }
      finally { inFlight = false; }
    };
    const id = setInterval(check, 10 * 1000);
    const startTimeout = setTimeout(check, 2000);
    return () => { mounted = false; clearInterval(id); clearTimeout(startTimeout); };
  }, [load]);

  const onCancel = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await cancelMyBooking(id);
      load();
    } catch (err) {
      const msg = err?.data?.message || err?.message || "Failed to cancel booking";
      setError(msg);
      if (err?.status === 401 || String(msg).toLowerCase().includes("not authorized")) {
        navigate("/signin");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded-xl w-1/3" />
            <div className="h-40 bg-gray-200 rounded-2xl" />
            <div className="h-40 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">My Bookings</h1>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaInbox className="text-4xl text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Bookings Yet</h3>
            <p className="text-gray-500 mb-6">
              You haven't made any bookings. Start exploring properties!
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Bookings</h1>
            <p className="text-gray-500 mt-1">
              {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 
              rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <FaHome className="text-sm" />
            Browse Properties
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 
            flex items-start gap-3 animate-fade-in">
            <FaExclamationTriangle className="text-red-500 shrink-0 mt-0.5" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Bookings List */}
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b._id}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden
                hover:shadow-xl transition-all duration-300 group"
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Left: Property Info */}
                  <div className="flex-1">
                    {/* Property Title */}
                    {b?.property?._id ? (
                      <Link
                        to={`/properties/${b.property._id}`}
                        className="text-xl font-semibold text-gray-800 hover:text-teal-600 
                          transition-colors flex items-center gap-2 group/link"
                      >
                        <FaHome className="text-teal-500 text-lg" />
                        {b?.property?.title || "(Untitled property)"}
                        <span className="text-teal-500 opacity-0 group-hover/link:opacity-100 
                          transition-opacity">→</span>
                      </Link>
                    ) : (
                      <div className="text-xl font-semibold text-gray-400 flex items-center gap-2">
                        <FaHome />
                        Property not available
                      </div>
                    )}

                    {/* Status Badge & Type */}
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border 
                        ${getStatusStyles(b?.status)}`}>
                        {prettyStatus(b?.status)}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium 
                        bg-gray-100 text-gray-700 border border-gray-200">
                        {b?.bookingType === "reserve" ? "🎯 Reservation" : "👁️ Visit Request"}
                      </span>
                    </div>

                    {/* Details Grid */}
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaCalendarAlt className="text-teal-500" />
                        <span>Booked: {formatDateTime(b?.bookingDate)}</span>
                      </div>

                      {b?.status === "pending" && b?.sellerViewedAt && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaEye className="text-blue-500" />
                          <span>Seen: {formatDateTime(b.sellerViewedAt)}</span>
                        </div>
                      )}

                      {b?.sellerRespondedAt && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaReply className="text-green-500" />
                          <span>Responded: {formatDateTime(b.sellerRespondedAt)}</span>
                        </div>
                      )}

                      {b.visitTime && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaClock className="text-orange-500" />
                          <span>Time: {b.visitTime}</span>
                        </div>
                      )}

                      {b.contactPhone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaPhone className="text-purple-500" />
                          <span>{b.contactPhone}</span>
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    {b.notes && (
                      <div className="mt-4 bg-gray-50 rounded-xl p-3 flex items-start gap-2">
                        <FaStickyNote className="text-gray-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-600">{b.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col gap-2 lg:items-end shrink-0">
                    {(() => {
                      const isReservation = b?.bookingType === "reserve";
                      const status = String(b?.status || "").toLowerCase();
                      const canPayForStatus = !["rejected", "cancelled", "completed"].includes(status);

                      if (isReservation) {
                        if (!canPayForStatus) {
                          return (
                            <div className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl 
                              text-sm font-medium flex items-center gap-2">
                              <FaCheckCircle />
                              Token not payable
                            </div>
                          );
                        }
                        if (stripeEnabled === false) {
                          return (
                            <button
                              disabled
                              className="px-4 py-2 bg-gray-200 text-gray-500 rounded-xl 
                                text-sm font-medium cursor-not-allowed"
                            >
                              Payments not configured
                            </button>
                          );
                        }
                        return (
                          <Link
                            to={`/booking/${b._id}/pay`}
                            className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 
                              text-white rounded-xl text-sm font-semibold
                              hover:from-teal-700 hover:to-teal-800 transition-all duration-300
                              shadow-lg shadow-teal-500/25 flex items-center gap-2"
                          >
                            <FaCreditCard />
                            Pay Token
                          </Link>
                        );
                      }
                      return null;
                    })()}

                    {!["rejected", "cancelled", "completed"].includes(String(b?.status || "").toLowerCase()) && (
                      <button
                        onClick={() => onCancel(b._id)}
                        className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 
                          rounded-xl text-sm font-medium hover:bg-red-100 hover:border-red-300
                          transition-all duration-200 flex items-center gap-2"
                      >
                        <FaTimes />
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
