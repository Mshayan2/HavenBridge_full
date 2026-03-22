import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { verifyEmail } from "../api/auth";
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaArrowRight, FaRedo, FaShieldAlt } from "react-icons/fa";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";

  const [state, setState] = useState({ loading: true, ok: false, message: "" });

  useEffect(() => {
    let alive = true;

    (async () => {
      if (!token) {
        if (!alive) return;
        setState({ loading: false, ok: false, message: "Missing verification token." });
        return;
      }

      try {
        const res = await verifyEmail({ token });
        if (!alive) return;
        setState({ loading: false, ok: true, message: res?.message || "Email verified successfully." });
      } catch (err) {
        if (!alive) return;
        setState({
          loading: false,
          ok: false,
          message: err?.data?.message || err?.message || "Verification failed. The link may have expired.",
        });
      }
    })();

    return () => {
      alive = false;
    };
  }, [token]);

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-10
      bg-gradient-to-br from-teal-50 via-white to-gray-50">
      
      <div className="w-full max-w-md animate-fade-in">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          
          {/* Loading State */}
          {state.loading && (
            <>
              <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-10 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full 
                  bg-white/20 backdrop-blur-sm mb-4">
                  <FaSpinner className="text-4xl text-white animate-spin" />
                </div>
                <h2 className="text-2xl font-bold text-white">Verifying Email</h2>
                <p className="text-teal-100 mt-2 text-sm">Please wait while we verify your email...</p>
              </div>
              <div className="p-8 text-center">
                <div className="flex items-center justify-center gap-2 text-gray-500">
                  <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </>
          )}

          {/* Success State */}
          {!state.loading && state.ok && (
            <>
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-10 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full 
                  bg-white/20 backdrop-blur-sm mb-4 animate-scale-in">
                  <FaCheckCircle className="text-5xl text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Email Verified!</h2>
                <p className="text-green-100 mt-2 text-sm">Your account is now active</p>
              </div>
              <div className="p-8">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                  <p className="text-green-800 text-sm">{state.message}</p>
                </div>

                <div className="space-y-3">
                  <Link
                    to="/signin"
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl 
                      font-semibold text-white bg-gradient-to-r from-teal-600 to-teal-700
                      hover:from-teal-700 hover:to-teal-800 transition-all duration-300
                      shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30"
                  >
                    <span>Sign In to Your Account</span>
                    <FaArrowRight />
                  </Link>
                </div>

                {/* Success animation confetti dots */}
                <div className="mt-6 flex items-center justify-center gap-4 text-2xl">
                  <span className="animate-bounce" style={{ animationDelay: '0ms' }}>🎉</span>
                  <span className="animate-bounce" style={{ animationDelay: '100ms' }}>✨</span>
                  <span className="animate-bounce" style={{ animationDelay: '200ms' }}>🎊</span>
                </div>
              </div>
            </>
          )}

          {/* Error State */}
          {!state.loading && !state.ok && (
            <>
              <div className="bg-gradient-to-r from-red-500 to-rose-600 p-10 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full 
                  bg-white/20 backdrop-blur-sm mb-4">
                  <FaTimesCircle className="text-5xl text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Verification Failed</h2>
                <p className="text-red-100 mt-2 text-sm">We couldn't verify your email</p>
              </div>
              <div className="p-8">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <p className="text-red-700 text-sm">{state.message}</p>
                </div>

                <div className="space-y-3">
                  <Link
                    to="/check-email"
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl 
                      font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600
                      hover:from-orange-600 hover:to-orange-700 transition-all duration-300
                      shadow-lg shadow-orange-500/25"
                  >
                    <FaRedo />
                    <span>Resend Verification Email</span>
                  </Link>
                  <Link
                    to="/signin"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl 
                      font-medium text-gray-700 border border-gray-200
                      hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                  >
                    <span>Back to Sign In</span>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Security Note */}
        <div className="mt-6 bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
              <FaShieldAlt className="text-teal-600 text-sm" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Security Notice</p>
              <p className="text-xs text-gray-500 mt-1">
                Verification links expire for your security. If your link expired, 
                you can request a new one from the resend page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
