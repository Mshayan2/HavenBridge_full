import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { getPropertyById } from "../api/properties";
import { createBooking } from "../api/bookings";
import {
  getReservationQuote,
  getMyReservationForProperty,
  startReservation,
  resumeReservationFeePayment,
  payRemainingBalance,
} from "../api/reservations";
import { toAssetUrl } from "../utils/url";
import { 
  FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaShieldAlt, 
  FaCreditCard, FaCheckCircle, FaCalendarAlt, FaClock, FaUser, 
  FaEnvelope, FaPhone, FaArrowLeft, FaHome, FaExclamationTriangle,
  FaLock, FaInfoCircle, FaStickyNote
} from "react-icons/fa";

export default function BookingPage() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [reservationQuote, setReservationQuote] = useState(null);
  const [myReservation, setMyReservation] = useState(null);
  const [reservationLoading, setReservationLoading] = useState(false);
  const [form, setForm] = useState({ 
    bookingDate: "", 
    visitTime: "", 
    guests: 1, 
    contactPhone: "", 
    contactEmail: "", 
    notes: "",
    agreeToTerms: false
  });

  const mode = (searchParams.get("mode") || "").toLowerCase();
  const isReserveMode = mode === "reserve";

  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;

    const load = async () => {
      try {
        const data = await getPropertyById(propertyId, { signal: controller.signal });
        if (!mounted) return;
        setProperty(data);
      } catch (err) {
        if (err?.aborted || err?.name === 'AbortError') return;
        console.error(err);
        if (!mounted) return;
        setError(err?.data?.message || err?.message || "Failed to load property");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [propertyId]);

  // Reservation quote + current user's reservation (if logged in)
  useEffect(() => {
    if (!isReserveMode) return;

    const controller = new AbortController();
    let mounted = true;

    const loadReservation = async () => {
      setReservationLoading(true);
      try {
        const q = await getReservationQuote(propertyId, { signal: controller.signal });
        if (!mounted) return;
        setReservationQuote(q || null);

        const token = localStorage.getItem("token");
        if (!token) {
          setMyReservation(null);
          return;
        }

        const mine = await getMyReservationForProperty(propertyId, { signal: controller.signal });
        if (!mounted) return;
        setMyReservation(mine || null);
      } catch (err) {
        if (err?.aborted || err?.name === "AbortError") return;
        console.error(err);
        if (!mounted) return;
        setReservationQuote(null);
        setMyReservation(null);
      } finally {
        if (mounted) setReservationLoading(false);
      }
    };

    loadReservation();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, [isReserveMode, propertyId]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin", { state: { redirectTo: `/book/${propertyId}${isReserveMode ? "?mode=reserve" : ""}` } });
      return;
    }

    if (isReserveMode && !form.agreeToTerms) {
      setError("Please agree to the reservation terms to continue.");
      return;
    }

    setSubmitting(true);
    try {
      if (isReserveMode) {
        // Reservation flow: start or resume fee payment
        if (myReservation?._id) {
          const status = String(myReservation.status || "");
          if (status === "pending_fee") {
            const out = await resumeReservationFeePayment(myReservation._id);
            if (out?.url) {
              window.location.assign(out.url);
              return;
            }
            throw new Error("Could not create checkout session");
          }

          if (status === "active") {
            navigate("/my-reservations");
            return;
          }
        }

        const out = await startReservation(propertyId);
        if (out?.url) {
          window.location.assign(out.url);
          return;
        }
        throw new Error("Could not create checkout session");
      }

      // Visit booking flow
      let bookingDateIso = form.bookingDate;
      if (form.bookingDate && form.visitTime) {
        bookingDateIso = new Date(`${form.bookingDate}T${form.visitTime}`).toISOString();
      }

      const payload = {
        property: propertyId,
        bookingType: "visit",
        bookingDate: bookingDateIso,
        visitTime: form.visitTime,
        contactPhone: form.contactPhone,
        contactEmail: form.contactEmail,
        guests: Number(form.guests) || 1,
        notes: form.notes,
      };

      await createBooking(payload);
      navigate("/my-bookings");
    } catch (err) {
      console.error(err);
      setError(err?.data?.message || err?.message || "Request failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-teal-600 animate-spin"></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Property</h3>
          <p className="text-gray-500">Please wait a moment...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaExclamationTriangle className="text-4xl text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Property Not Found</h2>
          <p className="text-gray-500 mb-6">
            The property you're looking for doesn't exist or has been removed.
          </p>
          <Link 
            to="/properties" 
            className="inline-flex items-center gap-2 px-6 py-3 
              bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl 
              font-semibold hover:from-teal-700 hover:to-teal-800
              transition-all duration-300 shadow-lg shadow-teal-500/25"
          >
            <FaHome />
            Browse Properties
          </Link>
        </div>
      </div>
    );
  }

  const formatMoneyFromMinor = (amountMinor, currency) => {
    const cur = String(currency || "pkr").toUpperCase();
    const n = Number(amountMinor);
    if (!Number.isFinite(n) || n === 0) return "Free";
    const major = n / 100;
    try {
      return new Intl.NumberFormat("en-PK", { style: "currency", currency: cur }).format(major);
    } catch {
      return `${cur} ${major.toLocaleString()}`;
    }
  };

  const formatPricePKR = (price) => {
    const n = Number(price);
    if (!Number.isFinite(n)) return "—";
    return `PKR ${n.toLocaleString("en-PK")}`;
  };

  const reserveEnabled = property?.reservation?.enabled !== false;
  const quoteCurrency = String(reservationQuote?.currency || "pkr").toLowerCase();
  const feePercent = Number(reservationQuote?.reservationFeePercent) || 2;
  const feeMinor = Number(reservationQuote?.reservationFee) || 0;
  const remainingMinor = Number(reservationQuote?.remainingAmount) || 0;
  const durationHours = Number(reservationQuote?.durationHours) || 48;
  const stripeConfigured = reservationQuote?.stripeConfigured ?? true;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-3">
              <Link to="/properties" className="hover:text-teal-600 transition-colors">Properties</Link>
              <span className="text-gray-300">/</span>
              <Link 
                to={`/properties/${propertyId}`} 
                className="hover:text-teal-600 transition-colors max-w-[150px] truncate"
              >
                {property.title}
              </Link>
              <span className="text-gray-300">/</span>
              <span className="text-gray-700 font-medium">{isReserveMode ? "Reserve" : "Book Visit"}</span>
            </nav>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
                {isReserveMode ? <FaCreditCard className="text-teal-600" /> : <FaCalendarAlt className="text-teal-600" />}
              </span>
              {isReserveMode ? "Reserve This Property" : "Schedule a Visit"}
            </h1>
          </div>
          <Link 
            to={`/properties/${propertyId}`} 
            className="inline-flex items-center gap-2 px-5 py-2.5 
              border border-gray-200 rounded-xl text-gray-700 font-medium
              hover:bg-gray-50 transition-all duration-200"
          >
            <FaArrowLeft className="text-sm" />
            Back to Property
          </Link>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 
            flex items-start gap-3 animate-fade-in">
            <FaExclamationTriangle className="text-red-500 shrink-0 mt-0.5" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property Info & Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-80 h-56 md:h-auto shrink-0 relative overflow-hidden">
                  <img
                    src={toAssetUrl(property.images?.[0])}
                    alt={property.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    onError={(e) => {
                      if (e.target.dataset._hadError) return;
                      e.target.dataset._hadError = '1';
                      e.target.src = '/vite.svg';
                    }}
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1.5 bg-white/95 backdrop-blur rounded-full text-xs font-semibold text-gray-700 shadow">
                      {property.type}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{property.title}</h3>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <FaMapMarkerAlt className="text-teal-500 shrink-0" />
                        <span>{property.location}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-bold text-teal-600">{formatPricePKR(property.price)}</div>
                      <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider">
                        {property.purpose || "Sale"}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-5 text-sm text-gray-600 border-t border-gray-100 pt-4 mt-5">
                    {property.bedrooms !== undefined && (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                          <FaBed className="text-gray-500" />
                        </div>
                        <span className="font-medium">{property.bedrooms} Beds</span>
                      </div>
                    )}
                    {property.bathrooms !== undefined && (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                          <FaBath className="text-gray-500" />
                        </div>
                        <span className="font-medium">{property.bathrooms} Baths</span>
                      </div>
                    )}
                    {property.area && (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                          <FaRulerCombined className="text-gray-500" />
                        </div>
                        <span className="font-medium">{property.area} sq ft</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                  {isReserveMode ? <FaCreditCard className="text-teal-600 text-sm" /> : <FaCalendarAlt className="text-teal-600 text-sm" />}
                </span>
                {isReserveMode ? "Reservation Details" : "Visit Details"}
              </h3>

              {isReserveMode ? (
                <div className="space-y-5">
                  {/* Fee Info */}
                  <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl p-4 border border-teal-100">
                    <div className="text-sm text-gray-700">
                      Pay a <span className="font-bold text-teal-700">{feePercent}%</span> reservation fee to secure this property for{" "}
                      <span className="font-bold text-teal-700">{durationHours} hours</span>.
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                      <span className="text-sm text-gray-600">Reservation Fee</span>
                      <span className="font-bold text-gray-900">
                        {reservationLoading ? (
                          <span className="inline-block w-16 h-4 bg-gray-200 rounded animate-pulse" />
                        ) : formatMoneyFromMinor(feeMinor, quoteCurrency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-sm text-gray-600">Remaining Balance</span>
                      <span className="font-bold text-gray-900">
                        {reservationLoading ? (
                          <span className="inline-block w-20 h-4 bg-gray-200 rounded animate-pulse" />
                        ) : formatMoneyFromMinor(remainingMinor, quoteCurrency)}
                      </span>
                    </div>
                  </div>

                  {/* Warning Note */}
                  <div className="flex items-start gap-3 text-xs text-gray-500 bg-amber-50 border border-amber-100 rounded-xl p-3">
                    <FaInfoCircle className="text-amber-500 shrink-0 mt-0.5" />
                    <span>
                      If the reservation expires before you pay the remaining balance, the reservation fee is non-refundable.
                    </span>
                  </div>

                  {/* Stripe Warning */}
                  {!stripeConfigured && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                      <div className="flex items-start gap-3">
                        <FaExclamationTriangle className="text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">Payments Disabled</p>
                          <p className="text-xs mt-1 text-amber-700">
                            Stripe is not configured. Set <code className="bg-amber-100 px-1 rounded">STRIPE_SECRET_KEY</code> in{" "}
                            <code className="bg-amber-100 px-1 rounded">backend/.env</code> and restart the server.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Terms Checkbox */}
                  <div className="pt-2 border-t border-gray-100">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        name="agreeToTerms"
                        checked={form.agreeToTerms}
                        onChange={onChange}
                        className="mt-0.5 h-5 w-5 text-teal-600 border-gray-300 rounded 
                          focus:ring-teal-500 transition-colors cursor-pointer"
                      />
                      <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                        I understand and agree that the reservation fee is{" "}
                        <span className="font-semibold">non-refundable</span> if the reservation expires.
                      </span>
                    </label>
                  </div>

                  {/* Action Button */}
                  {myReservation?.status === "active" ? (
                    <button
                      type="button"
                      disabled={submitting || !stripeConfigured}
                      onClick={async () => {
                        setError("");
                        setSubmitting(true);
                        try {
                          const out = await payRemainingBalance(myReservation._id);
                          if (out?.url) window.location.assign(out.url);
                          else setError("Could not create checkout session");
                        } catch (e) {
                          setError(e?.data?.message || e?.message || "Failed to start remaining payment");
                        } finally {
                          setSubmitting(false);
                        }
                      }}
                      className="w-full bg-gradient-to-r from-gray-800 to-gray-900 
                        hover:from-gray-900 hover:to-black text-white font-semibold 
                        py-3.5 px-6 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed 
                        transition-all duration-300 flex items-center justify-center gap-2
                        shadow-lg shadow-gray-900/20"
                    >
                      <FaCreditCard />
                      Pay Remaining Balance
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={submitting || !reserveEnabled || !form.agreeToTerms || !stripeConfigured}
                      className="w-full bg-gradient-to-r from-teal-600 to-teal-700 
                        hover:from-teal-700 hover:to-teal-800 text-white font-semibold 
                        py-3.5 px-6 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed 
                        transition-all duration-300 flex items-center justify-center gap-2
                        shadow-lg shadow-teal-500/25"
                    >
                      {submitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Opening Checkout...
                        </>
                      ) : (
                        <>
                          <FaCreditCard />
                          Pay Reservation Fee
                        </>
                      )}
                    </button>
                  )}

                  {/* Link to Reservations */}
                  <div className="text-center text-sm text-gray-500">
                    Manage all reservations at{" "}
                    <Link to="/my-reservations" className="text-teal-600 font-medium hover:underline">
                      My Reservations
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="flex items-center gap-2">
                          <FaCalendarAlt className="text-gray-400" />
                          Preferred Date <span className="text-red-500">*</span>
                        </span>
                      </label>
                      <input
                        required
                        name="bookingDate"
                        value={form.bookingDate}
                        onChange={onChange}
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 
                          focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 
                          transition-all duration-200 outline-none"
                      />
                    </div>

                    {/* Time */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="flex items-center gap-2">
                          <FaClock className="text-gray-400" />
                          Preferred Time
                        </span>
                      </label>
                      <input
                        name="visitTime"
                        value={form.visitTime}
                        onChange={onChange}
                        type="time"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 
                          focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 
                          transition-all duration-200 outline-none"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="flex items-center gap-2">
                          <FaEnvelope className="text-gray-400" />
                          Your Email <span className="text-red-500">*</span>
                        </span>
                      </label>
                      <input
                        required
                        name="contactEmail"
                        value={form.contactEmail}
                        onChange={onChange}
                        type="email"
                        placeholder="you@example.com"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 
                          focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 
                          transition-all duration-200 outline-none"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="flex items-center gap-2">
                          <FaPhone className="text-gray-400" />
                          Phone Number <span className="text-red-500">*</span>
                        </span>
                      </label>
                      <input
                        required
                        name="contactPhone"
                        value={form.contactPhone}
                        onChange={onChange}
                        type="tel"
                        placeholder="+92 3XX XXXXXXX"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 
                          focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 
                          transition-all duration-200 outline-none"
                      />
                    </div>

                    {/* Guests */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="flex items-center gap-2">
                          <FaUser className="text-gray-400" />
                          Number of Guests
                        </span>
                      </label>
                      <input
                        name="guests"
                        value={form.guests}
                        onChange={onChange}
                        type="number"
                        min={1}
                        max={20}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 
                          focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 
                          transition-all duration-200 outline-none"
                      />
                    </div>

                    {/* Notes */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="flex items-center gap-2">
                          <FaStickyNote className="text-gray-400" />
                          Additional Notes (Optional)
                        </span>
                      </label>
                      <textarea
                        name="notes"
                        value={form.notes}
                        onChange={onChange}
                        placeholder="Any specific areas you'd like to see during the visit..."
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 
                          focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 
                          transition-all duration-200 outline-none resize-none"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Mobile Submit Button */}
                  <div className="mt-6 lg:hidden">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-gradient-to-r from-teal-600 to-teal-700 
                        hover:from-teal-700 hover:to-teal-800 text-white font-semibold 
                        py-3.5 px-6 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed 
                        transition-all duration-300 flex items-center justify-center gap-2
                        shadow-lg shadow-teal-500/25"
                    >
                      {submitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <FaCalendarAlt />
                          Request Visit
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>

          {/* Right Column - Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-5">
                {isReserveMode ? "Reservation Summary" : "Booking Summary"}
              </h3>

              {isReserveMode && (
                <div className="mb-5">
                  {!reserveEnabled ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">
                      <div className="flex items-start gap-3">
                        <FaExclamationTriangle className="shrink-0 mt-0.5" />
                        <span>Reservations are currently disabled for this property.</span>
                      </div>
                    </div>
                  ) : myReservation?.status === "active" ? (
                    <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-xl p-4 text-sm text-teal-800">
                      <div className="flex items-start gap-3">
                        <FaCheckCircle className="shrink-0 mt-0.5 text-teal-600" />
                        <span>You have an active reservation. Pay the remaining balance before it expires!</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-xl p-4 text-sm text-teal-800">
                      <div className="flex items-start gap-3">
                        <FaShieldAlt className="shrink-0 mt-0.5 text-teal-600" />
                        <span>Pay the reservation fee to lock this property for {durationHours} hours.</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Property Price</span>
                  <span className="font-bold text-gray-900">{formatPricePKR(property.price)}</span>
                </div>
                
                {isReserveMode && (
                  <>
                    <div className="border-t border-gray-100 pt-3">
                      <div className="flex justify-between text-gray-600">
                        <span>Reservation Fee</span>
                        <span className="font-bold text-gray-900">
                          {reservationLoading ? "…" : formatMoneyFromMinor(feeMinor, quoteCurrency)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {feePercent}% of property price. Non-refundable if expired.
                      </p>
                    </div>

                    <div className="border-t border-gray-100 pt-3">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-900">Remaining Balance</span>
                        <span className="font-bold text-teal-600 text-base">
                          {reservationLoading ? "…" : formatMoneyFromMinor(remainingMinor, quoteCurrency)}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Desktop Submit Button (Visit Mode) */}
              {!isReserveMode && (
                <div className="mt-6 hidden lg:block">
                  <button
                    type="submit"
                    onClick={onSubmit}
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-teal-600 to-teal-700 
                      hover:from-teal-700 hover:to-teal-800 text-white font-semibold 
                      py-3.5 px-6 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed 
                      transition-all duration-300 flex items-center justify-center gap-2
                      shadow-lg shadow-teal-500/25"
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaCalendarAlt />
                        Request Visit
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Trust Signals */}
              <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                    <FaLock className="text-green-500 text-xs" />
                  </div>
                  <span>Secure & encrypted payment</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                    <FaCheckCircle className="text-green-500 text-xs" />
                  </div>
                  <span>Verified property listing</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                    <FaShieldAlt className="text-green-500 text-xs" />
                  </div>
                  <span>Protected by HavenBridge</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
