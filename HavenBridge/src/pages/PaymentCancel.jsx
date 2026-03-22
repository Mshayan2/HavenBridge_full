import React from "react";
import { Link } from "react-router-dom";
import { FaTimesCircle, FaRedo, FaCalendarCheck, FaHome, FaInfoCircle } from "react-icons/fa";

export default function PaymentCancel() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-amber-50 via-white to-gray-50 
      flex items-center justify-center px-4 py-12">
      
      <div className="w-full max-w-lg animate-fade-in">
        {/* Cancel Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-10 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full 
              bg-white/20 backdrop-blur-sm mb-4">
              <FaTimesCircle className="text-5xl text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Payment Cancelled</h1>
            <p className="text-amber-100 mt-2">Your payment was not processed</p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Info Message */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-center">
              <p className="text-amber-800">
                No worries! Your payment was cancelled and you haven't been charged. 
                You can try again anytime.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link
                to="/my-reservations"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 
                  bg-gray-900 text-white rounded-xl font-semibold
                  hover:bg-gray-800 transition-all duration-300 shadow-lg"
              >
                <FaRedo />
                Back to My Reservations
              </Link>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/my-bookings"
                  className="inline-flex items-center justify-center gap-2 py-3 
                    border border-gray-200 rounded-xl text-gray-700 font-medium
                    hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                >
                  <FaCalendarCheck className="text-sm" />
                  My Bookings
                </Link>
                <Link
                  to="/properties"
                  className="inline-flex items-center justify-center gap-2 py-3 
                    border border-gray-200 rounded-xl text-gray-700 font-medium
                    hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                >
                  <FaHome className="text-sm" />
                  Properties
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Help Note */}
        <div className="mt-6 bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <FaInfoCircle className="text-blue-600 text-sm" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Need Help?</p>
              <p className="text-xs text-gray-500 mt-1">
                If you're experiencing issues with payment, please contact our support team 
                or try using a different payment method.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
