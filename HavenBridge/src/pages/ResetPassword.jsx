import React, { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { resetPassword } from "../api/auth";
import PasswordStrength from "../components/auth/PasswordStrength";
import { FaLock, FaEye, FaEyeSlash, FaArrowLeft, FaCheckCircle, FaExclamationTriangle, FaShieldAlt } from "react-icons/fa";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [state, setState] = useState({ loading: false, done: false, error: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const errors = useMemo(() => {
    const e = {};
    if (!token) e.token = "Missing reset token";

    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 12) e.password = "Use at least 12 characters";

    if (!form.confirmPassword) e.confirmPassword = "Confirm your password";
    else if (form.confirmPassword !== form.password) e.confirmPassword = "Passwords do not match";

    return e;
  }, [token, form]);

  const canSubmit = Object.keys(errors).length === 0 && !state.loading;

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setState({ loading: true, done: false, error: "" });
    try {
      await resetPassword({ token, password: form.password });
      setState({ loading: false, done: true, error: "" });
    } catch (err) {
      setState({ loading: false, done: false, error: err?.data?.message || err?.message || "Reset failed" });
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-10
      bg-gradient-to-br from-teal-50 via-white to-gray-50">
      
      <div className="w-full max-w-lg animate-fade-in">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full 
              bg-white/20 backdrop-blur-sm mb-4">
              <FaLock className="text-3xl text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Reset Password</h2>
            <p className="text-teal-100 mt-2 text-sm">Choose a new password for your account</p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Token Error */}
            {errors.token && (
              <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 
                flex items-start gap-3 animate-fade-in">
                <FaExclamationTriangle className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-700 font-medium">{errors.token}</p>
                  <Link to="/forgot-password" className="text-xs text-red-600 underline mt-1 inline-block">
                    Request a new reset link
                  </Link>
                </div>
              </div>
            )}

            {/* Success State */}
            {state.done && (
              <div className="text-center py-4 animate-fade-in">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full 
                  bg-green-100 mb-4">
                  <FaCheckCircle className="text-3xl text-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Password Updated!</h3>
                <p className="text-gray-600 text-sm mb-6">
                  Your password has been successfully changed.
                </p>
                <Link
                  to="/signin"
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl 
                    font-semibold text-white bg-gradient-to-r from-teal-600 to-teal-700
                    hover:from-teal-700 hover:to-teal-800 transition-all duration-300
                    shadow-lg shadow-teal-500/25"
                >
                  Sign In to Your Account
                </Link>
              </div>
            )}

            {/* Form */}
            {!state.done && (
              <form onSubmit={submit} className="space-y-5">
                {/* Error Message */}
                {state.error && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-4 
                    flex items-start gap-3 animate-fade-in">
                    <FaExclamationTriangle className="text-red-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-red-700">{state.error}</span>
                  </div>
                )}

                {/* New Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <FaLock />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                      className={`w-full pl-11 pr-12 py-3 border rounded-xl 
                        focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                        transition-all duration-200 bg-gray-50 focus:bg-white
                        ${errors.password && form.password ? 'border-red-300' : 'border-gray-200'}`}
                      placeholder="Enter new password"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 
                        hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.password && form.password && (
                    <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                      <FaExclamationTriangle className="text-xs" />
                      {errors.password}
                    </p>
                  )}
                  <div className="mt-3">
                    <PasswordStrength password={form.password} email={""} phone={""} />
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <FaLock />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                      className={`w-full pl-11 pr-12 py-3 border rounded-xl 
                        focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                        transition-all duration-200 bg-gray-50 focus:bg-white
                        ${errors.confirmPassword && form.confirmPassword ? 'border-red-300' : 'border-gray-200'}`}
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 
                        hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.confirmPassword && form.confirmPassword && (
                    <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                      <FaExclamationTriangle className="text-xs" />
                      {errors.confirmPassword}
                    </p>
                  )}
                  {!errors.confirmPassword && form.confirmPassword && (
                    <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                      <FaCheckCircle className="text-xs" />
                      Passwords match
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full py-3.5 rounded-xl font-semibold text-white
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
                      <span>Updating Password…</span>
                    </>
                  ) : (
                    <>
                      <FaShieldAlt />
                      <span>Update Password</span>
                    </>
                  )}
                </button>

                {/* Back to Sign In */}
                <div className="text-center pt-2">
                  <Link 
                    to="/signin" 
                    className="inline-flex items-center gap-2 text-sm text-teal-600 
                      hover:text-teal-700 font-medium transition-colors"
                  >
                    <FaArrowLeft className="text-xs" />
                    Back to Sign In
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            If your link expired, request a new one from{" "}
            <Link to="/forgot-password" className="text-teal-600 hover:text-teal-700 font-medium underline">
              Forgot Password
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
