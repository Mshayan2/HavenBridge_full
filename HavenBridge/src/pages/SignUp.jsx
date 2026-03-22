import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

import { registerUser } from "../api/auth";
import PasswordStrength from "../components/auth/PasswordStrength";

const nameRegex = /^[A-Za-z .'-]{2,80}$/;

function validateEmailFormat(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

export default function SignUp() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneE164: "",
    password: "",
    confirmPassword: "",
    terms: false,
    marketing: false,
  });

  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const errors = useMemo(() => {
    const e = {};

    const name = form.name.trim().replace(/\s+/g, " ");
    if (!name) e.name = "Full Name is required";
    else if (!nameRegex.test(name)) e.name = "2–80 chars; letters/spaces/.'- only";

    const email = form.email.trim().toLowerCase();
    if (!email) e.email = "Email is required";
    else if (!validateEmailFormat(email)) e.email = "Enter a valid email";

    if (!form.phoneE164) e.phoneE164 = "Phone number is required";

    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 12) e.password = "Use at least 12 characters";

    if (!form.confirmPassword) e.confirmPassword = "Confirm your password";
    else if (form.confirmPassword !== form.password) e.confirmPassword = "Passwords do not match";

    if (!form.terms) e.terms = "You must accept Terms & Privacy";

    return e;
  }, [form]);

  const canSubmit = Object.keys(errors).length === 0 && !loading;

  const onBlur = (key) => setTouched((t) => ({ ...t, [key]: true }));

  const submit = async (e) => {
    e.preventDefault();
    setServerError("");
    setTouched({ name: true, email: true, phoneE164: true, password: true, confirmPassword: true, terms: true });
    if (!canSubmit) return;

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim().replace(/\s+/g, " "),
        email: form.email.trim().toLowerCase(),
        phoneE164: form.phoneE164,
        password: form.password,
        role: "customer",
        marketingOptIn: !!form.marketing,
      };

      const res = await registerUser(payload);

      const debug = res?.debugVerifyUrl ? `&debug=${encodeURIComponent(res.debugVerifyUrl)}` : "";
      navigate(`/check-email?email=${encodeURIComponent(payload.email)}${debug}`);
    } catch (err) {
      setServerError(err?.data?.message || err?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = (field) => `
    w-full bg-gray-50 border rounded-xl px-4 py-3.5
    text-gray-800 placeholder-gray-400
    focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:bg-white
    transition-all duration-200
    ${touched[field] && errors[field] 
      ? "border-red-300 focus:border-red-500" 
      : "border-gray-200 focus:border-teal-500"}
  `;

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12
      bg-gradient-to-br from-teal-50 via-white to-gray-50">
      <div className="w-full max-w-lg animate-fade-in-up">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl 
              bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shadow-teal-500/30 mb-4">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
            <p className="text-gray-500 mt-1">Join HavenBridge to find your perfect property</p>
          </div>

          {serverError ? (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-100 p-4 
              flex items-start gap-3 animate-fade-in">
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-red-700">{serverError}</p>
            </div>
          ) : null}

          <form onSubmit={submit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <input
                name="name"
                value={form.name}
                onBlur={() => onBlur("name")}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g., Ali Khan"
                className={inputClasses("name")}
                autoComplete="name"
              />
              {touched.name && errors.name ? (
                <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.name}
                </p>
              ) : null}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onBlur={() => onBlur("email")}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
                className={inputClasses("email")}
                autoComplete="email"
              />
              {touched.email && errors.email ? (
                <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.email}
                </p>
              ) : null}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
              <div className={`border rounded-xl p-3 bg-gray-50 focus-within:ring-2 focus-within:ring-teal-500/20 
                focus-within:border-teal-500 focus-within:bg-white transition-all duration-200
                ${touched.phoneE164 && errors.phoneE164 ? "border-red-300" : "border-gray-200"}`}>
                <PhoneInput
                  placeholder="Enter phone number"
                  value={form.phoneE164}
                  onChange={(val) => setForm((f) => ({ ...f, phoneE164: val || "" }))}
                  onBlur={() => onBlur("phoneE164")}
                  defaultCountry="PK"
                  international
                  countryCallingCodeEditable={false}
                  className="phone-input-custom"
                />
              </div>
              {touched.phoneE164 && errors.phoneE164 ? (
                <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.phoneE164}
                </p>
              ) : (
                <p className="text-xs text-gray-500 mt-1.5">We'll use this for verification and security alerts.</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onBlur={() => onBlur("password")}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Create a strong password"
                  className={`${inputClasses("password")} pr-12`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 
                    hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {touched.password && errors.password ? (
                <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.password}
                </p>
              ) : null}
              <div className="mt-3">
                <PasswordStrength password={form.password} email={form.email} phone={form.phoneE164} />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onBlur={() => onBlur("confirmPassword")}
                  onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                  placeholder="Re-enter password"
                  className={`${inputClasses("confirmPassword")} pr-12`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 
                    hover:text-gray-600 transition-colors"
                >
                  {showConfirm ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {touched.confirmPassword && errors.confirmPassword ? (
                <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.confirmPassword}
                </p>
              ) : null}
            </div>

            {/* Terms & Marketing */}
            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={form.terms}
                    onChange={(e) => setForm((f) => ({ ...f, terms: e.target.checked }))}
                    onBlur={() => onBlur("terms")}
                    className="peer sr-only"
                  />
                  <div className={`w-5 h-5 border-2 rounded-md transition-all duration-200
                    peer-checked:bg-teal-600 peer-checked:border-teal-600
                    peer-focus:ring-2 peer-focus:ring-teal-500/20
                    ${touched.terms && errors.terms ? "border-red-300" : "border-gray-300 group-hover:border-gray-400"}`}>
                    <svg className="w-full h-full text-white opacity-0 peer-checked:opacity-100 transition-opacity" 
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {form.terms && (
                    <svg className="absolute w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-gray-700">
                  I agree to the <Link to="/terms" className="text-teal-600 hover:text-teal-700 font-medium underline-offset-2 hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-teal-600 hover:text-teal-700 font-medium underline-offset-2 hover:underline">Privacy Policy</Link>.
                </span>
              </label>
              {touched.terms && errors.terms ? (
                <p className="text-xs text-red-600 flex items-center gap-1 ml-8">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.terms}
                </p>
              ) : null}

              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={form.marketing}
                    onChange={(e) => setForm((f) => ({ ...f, marketing: e.target.checked }))}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 border-2 border-gray-300 rounded-md transition-all duration-200
                    peer-checked:bg-teal-600 peer-checked:border-teal-600
                    peer-focus:ring-2 peer-focus:ring-teal-500/20
                    group-hover:border-gray-400">
                  </div>
                  {form.marketing && (
                    <svg className="absolute w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-gray-600">Send me updates and offers (optional)</span>
              </label>
            </div>

            {/* Submit Button */}
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
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </span>
              ) : "Create account"}
            </button>

            {/* Sign in link */}
            <div className="text-center pt-2">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/signin" className="text-teal-600 font-semibold hover:text-teal-700 transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
