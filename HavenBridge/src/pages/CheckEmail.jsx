import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { resendVerification } from "../api/auth";
import { FaEnvelope, FaPaperPlane, FaArrowLeft, FaQuestionCircle, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

function validateEmailFormat(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

export default function CheckEmail() {
  const [params] = useSearchParams();
  const initialEmail = params.get("email") || "";
  const initialDebugUrl = params.get("debug") || "";
  const isDev = import.meta.env.DEV;

  const [email, setEmail] = useState(initialEmail);
  const [state, setState] = useState({ loading: false, message: "", type: "" });
  const [debugLink, setDebugLink] = useState(isDev ? initialDebugUrl : "");
  const [delivery, setDelivery] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const canResend = useMemo(() => validateEmailFormat(email) && !state.loading, [email, state.loading]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const onResend = async () => {
    if (!canResend || cooldown > 0) return;
    setState({ loading: true, message: "", type: "" });
    try {
      const res = await resendVerification({ email: email.trim().toLowerCase() });
      const msg = "Verification email sent. Check your inbox (and spam folder).";
      setDelivery(res?.emailDelivery || "");
      if (isDev && res?.debugVerifyUrl) setDebugLink(res.debugVerifyUrl);
      setCooldown(30);
      setState({ loading: false, message: msg, type: "success" });
    } catch (err) {
      setDelivery("");
      setState({ loading: false, message: err?.data?.message || err?.message || "Failed to send verification email", type: "error" });
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-10
      bg-gradient-to-br from-teal-50 via-white to-gray-50">
      
      <div className="w-full max-w-xl animate-fade-in">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 
              backdrop-blur-sm mb-4 animate-pulse">
              <FaEnvelope className="text-4xl text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Check Your Email</h2>
            <p className="text-teal-100 mt-2 text-sm">
              We sent you a verification link. Please click it to activate your account.
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Email illustration */}
            <div className="mb-6 text-center">
              <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-full text-sm">
                <FaPaperPlane className="animate-bounce" />
                <span>Verification email is on its way!</span>
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <FaEnvelope />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl 
                    focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                    transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <FaQuestionCircle className="text-gray-400" />
                Didn't get it? You can resend the verification email.
              </p>
            </div>

            {/* Resend Button */}
            <button
              onClick={onResend}
              disabled={!canResend || cooldown > 0}
              className="mt-6 w-full py-3.5 rounded-xl font-semibold text-white
                bg-gradient-to-r from-teal-600 to-teal-700
                hover:from-teal-700 hover:to-teal-800
                disabled:opacity-60 disabled:cursor-not-allowed
                transition-all duration-300 shadow-lg shadow-teal-500/25
                hover:shadow-xl hover:shadow-teal-500/30
                flex items-center justify-center gap-2"
            >
              {state.loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Sending…</span>
                </>
              ) : cooldown > 0 ? (
                <>
                  <span>Resend in {cooldown}s</span>
                </>
              ) : (
                <>
                  <FaPaperPlane />
                  <span>Resend Verification Email</span>
                </>
              )}
            </button>

            {/* Status Messages */}
            {state.message && (
              <div className={`mt-4 rounded-xl p-4 flex items-start gap-3 animate-fade-in
                ${state.type === "success" 
                  ? "bg-green-50 border border-green-200 text-green-800" 
                  : "bg-red-50 border border-red-200 text-red-700"
                }`}>
                <div className="shrink-0 mt-0.5">
                  {state.type === "success" 
                    ? <FaCheckCircle className="text-green-500" /> 
                    : <FaExclamationTriangle className="text-red-500" />
                  }
                </div>
                <span className="text-sm">{state.message}</span>
              </div>
            )}

            {delivery === "failed" && (
              <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-4 
                flex items-start gap-3 animate-fade-in">
                <FaExclamationTriangle className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-900 font-medium">
                    Email delivery issue
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    We couldn't deliver the email. Please try again in a minute. 
                    If this keeps happening, SMTP may not be configured on the backend.
                  </p>
                </div>
              </div>
            )}

            {isDev && debugLink && (
              <div className="mt-4 bg-gray-100 rounded-xl p-4 text-sm">
                <div className="font-medium text-gray-700 mb-2">🛠️ Dev Mode</div>
                <a 
                  className="text-teal-600 hover:text-teal-700 underline break-all" 
                  href={debugLink} 
                  target="_blank" 
                  rel="noreferrer"
                >
                  Open verify link (dev)
                </a>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-8 pb-8">
            <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row gap-3">
              <Link
                to="/signin"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 
                  rounded-xl border border-gray-200 text-gray-700 font-medium
                  hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
              >
                <FaArrowLeft className="text-sm" />
                Back to Sign In
              </Link>
              <a
                href="mailto:"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 
                  rounded-xl border border-gray-200 text-gray-700 font-medium
                  hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
              >
                <FaEnvelope className="text-sm" />
                Open Email App
              </a>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Can't find the email? Check your spam or junk folder.</p>
        </div>
      </div>
    </div>
  );
}
