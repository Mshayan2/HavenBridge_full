import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { createBookingTokenCheckoutSession } from "../api/payments";
import { FaCreditCard, FaExclamationTriangle, FaArrowLeft, FaCalendarCheck, FaLock } from "react-icons/fa";

export default function BookingPayment() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function go() {
      try {
        setError("");
        const data = await createBookingTokenCheckoutSession(bookingId);
        if (cancelled) return;
        if (data?.url) {
          window.location.assign(data.url);
        } else {
          setError("Failed to start checkout (missing URL).");
        }
      } catch (e) {
        const msg = e?.data?.message || e?.message || "Failed to start payment";

        // Keep the UI message, but avoid flooding the console in dev.
        if (import.meta.env.DEV) {
          const lower = String(msg || "").toLowerCase();
          const isExpected = lower.includes("stripe") && lower.includes("not configured");
          if (!isExpected) console.error(e);
        }

        setError(msg);
      }
    }

    if (!bookingId) {
      setError("Missing booking id");
      return;
    }

    go();
    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-8 text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FaCreditCard className="text-3xl text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Booking Token Payment</h1>
            <p className="text-teal-100 mt-2 text-sm">Securing your property visit</p>
          </div>

          {/* Content */}
          <div className="p-6">
            {error ? (
              <div className="animate-fade-in">
                <div className="p-4 rounded-xl border border-red-200 bg-red-50 mb-6">
                  <div className="flex items-start gap-3">
                    <FaExclamationTriangle className="text-red-500 shrink-0 mt-0.5" />
                    <div className="text-sm text-red-700">{error}</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate(-1)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 
                      bg-gray-900 text-white rounded-xl font-semibold
                      hover:bg-gray-800 transition-all duration-200"
                  >
                    <FaArrowLeft />
                    Go Back
                  </button>
                  <Link
                    to="/my-bookings"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 
                      border border-gray-200 text-gray-700 rounded-xl font-semibold
                      hover:bg-gray-50 transition-all duration-200"
                  >
                    <FaCalendarCheck />
                    My Bookings
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                {/* Loading Spinner */}
                <div className="relative w-16 h-16 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-teal-600 animate-spin"></div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Redirecting to Checkout
                </h3>
                <p className="text-gray-500 text-sm mb-6">
                  Please wait while we connect you to our secure payment processor...
                </p>

                {/* Security Note */}
                <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                  <FaLock className="text-green-500" />
                  <span>256-bit SSL Encrypted</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Help Text */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Having trouble? Contact our{" "}
          <Link to="/contact" className="text-teal-600 hover:underline">
            support team
          </Link>
        </p>
      </div>
    </div>
  );
}
