import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FaCheckCircle, FaHome, FaFileContract, FaCalendarCheck, FaInfoCircle } from "react-icons/fa";

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-green-50 via-white to-teal-50 
      flex items-center justify-center px-4 py-12">
      
      <div className="w-full max-w-lg animate-fade-in">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-10 text-center relative overflow-hidden">
            {/* Confetti Effect */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-4 left-10 text-3xl animate-bounce" style={{ animationDelay: '0ms' }}>🎉</div>
              <div className="absolute top-8 right-16 text-2xl animate-bounce" style={{ animationDelay: '200ms' }}>✨</div>
              <div className="absolute bottom-6 left-20 text-2xl animate-bounce" style={{ animationDelay: '100ms' }}>🎊</div>
              <div className="absolute bottom-4 right-10 text-3xl animate-bounce" style={{ animationDelay: '300ms' }}>💫</div>
            </div>
            
            <div className="relative">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full 
                bg-white/20 backdrop-blur-sm mb-4 animate-scale-in">
                <FaCheckCircle className="text-5xl text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Payment Successful!</h1>
              <p className="text-green-100 mt-2">Your payment has been processed successfully</p>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-center">
              <p className="text-green-800 font-medium">
                Thank you for your payment. Your transaction is complete.
              </p>
            </div>

            {/* Session ID */}
            {sessionId && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="text-xs text-gray-500 mb-1">Transaction Reference</div>
                <div className="font-mono text-sm text-gray-700 break-all">{sessionId}</div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link
                to="/my-reservations"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 
                  bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl 
                  font-semibold hover:from-teal-700 hover:to-teal-800
                  transition-all duration-300 shadow-lg shadow-teal-500/25"
              >
                <FaCalendarCheck />
                View My Reservations
              </Link>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/leases"
                  className="inline-flex items-center justify-center gap-2 py-3 
                    border border-gray-200 rounded-xl text-gray-700 font-medium
                    hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                >
                  <FaFileContract className="text-sm" />
                  My Leases
                </Link>
                <Link
                  to="/my-bookings"
                  className="inline-flex items-center justify-center gap-2 py-3 
                    border border-gray-200 rounded-xl text-gray-700 font-medium
                    hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                >
                  <FaCalendarCheck className="text-sm" />
                  My Bookings
                </Link>
              </div>

              <Link
                to="/properties"
                className="w-full inline-flex items-center justify-center gap-2 py-3 
                  border border-gray-200 rounded-xl text-gray-700 font-medium
                  hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
              >
                <FaHome />
                Browse More Properties
              </Link>
            </div>
          </div>
        </div>

        {/* Info Note */}
        <div className="mt-6 bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <FaInfoCircle className="text-blue-600 text-sm" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Processing Note</p>
              <p className="text-xs text-gray-500 mt-1">
                It may take a few moments for the system to confirm the payment via webhook. 
                If your status doesn't update immediately, please refresh in a minute.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
