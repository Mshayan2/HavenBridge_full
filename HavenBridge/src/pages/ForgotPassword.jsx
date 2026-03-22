import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api/auth";

function validateEmailFormat(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState({ loading: false, sent: false, error: "" });

  const canSubmit = useMemo(() => validateEmailFormat(email) && !state.loading, [email, state.loading]);

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setState({ loading: true, sent: false, error: "" });
    try {
      await forgotPassword({ email: email.trim().toLowerCase() });
      setState({ loading: false, sent: true, error: "" });
    } catch (err) {
      setState({ loading: false, sent: false, error: err?.data?.message || err?.message || "Failed to request reset" });
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12
      bg-gradient-to-br from-teal-50 via-white to-gray-50">
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl 
              bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shadow-teal-500/30 mb-4">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Forgot password?</h2>
            <p className="text-gray-500 mt-1">No worries, we'll send you reset instructions</p>
          </div>

          {state.sent ? (
            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 
                flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Check your email</h3>
              <p className="text-gray-600 text-sm mb-6">
                If an account exists for <span className="font-medium text-gray-900">{email}</span>, 
                we sent password reset instructions.
              </p>
              <Link 
                to="/signin" 
                className="inline-flex items-center gap-2 text-teal-600 font-semibold 
                  hover:text-teal-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              {state.error ? (
                <div className="mb-6 rounded-xl bg-red-50 border border-red-100 p-4 
                  flex items-start gap-3 animate-fade-in">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm text-red-700">{state.error}</p>
                </div>
              ) : null}

              <form onSubmit={submit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5
                      text-gray-800 placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white
                      transition-all duration-200"
                    autoComplete="email"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full py-3.5 px-6 rounded-xl font-semibold text-white
                    bg-gradient-to-r from-teal-600 to-teal-700
                    hover:from-teal-700 hover:to-teal-800
                    shadow-md hover:shadow-lg hover:shadow-teal-500/25
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md
                    transition-all duration-200 active:scale-[0.98]"
                >
                  {state.loading ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </span>
                  ) : "Send reset link"}
                </button>

                <div className="text-center">
                  <Link 
                    to="/signin" 
                    className="inline-flex items-center gap-2 text-sm text-gray-600 
                      hover:text-teal-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to sign in
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Footer text */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Tip: Check your spam/junk folder if you don't see the email
        </p>
      </div>
    </div>
  );
}
