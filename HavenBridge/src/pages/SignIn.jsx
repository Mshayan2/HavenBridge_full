import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, resendVerification } from "../api/auth";
import Container from "../components/ui/Container";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

function validateEmailFormat(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

export default function SignIn() {
  const navigate = useNavigate();
  const isDev = import.meta.env.DEV;

  const [form, setForm] = useState({
    email: "",
    password: "",
    rememberMe: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [needsVerify, setNeedsVerify] = useState(false);
  const [resendState, setResendState] = useState({ loading: false, message: "", type: "" });
  const [verifyDebugLink, setVerifyDebugLink] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const errors = useMemo(() => {
    const e = {};
    const email = form.email.trim().toLowerCase();
    if (!email) e.email = "Email is required";
    else if (!validateEmailFormat(email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    return e;
  }, [form.email, form.password]);

  const canSubmit = Object.keys(errors).length === 0 && !loading;

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const storeSession = ({ accessToken, user, rememberMe }) => {
    // token
    if (rememberMe) {
      localStorage.setItem("token", accessToken);
      sessionStorage.removeItem("token");
    } else {
      sessionStorage.setItem("token", accessToken);
      localStorage.removeItem("token");
    }

    // user
    const strUser = JSON.stringify(user || {});
    if (rememberMe) {
      localStorage.setItem("user", strUser);
      sessionStorage.removeItem("user");
    } else {
      sessionStorage.setItem("user", strUser);
      localStorage.removeItem("user");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setNeedsVerify(false);
    setResendState({ loading: false, message: "", type: "" });
    if (!canSubmit) return;

    setLoading(true);
    try {
      const payload = {
        email: form.email.trim().toLowerCase(),
        password: form.password,
        rememberMe: !!form.rememberMe,
      };

      const res = await loginUser(payload);
      const accessToken = res?.accessToken;
      const user = res?.user;
      const phoneVerificationRecommended = !!res?.phoneVerificationRecommended;

      if (!accessToken) {
        setServerError("Login succeeded but no access token was returned.");
        return;
      }

      storeSession({ accessToken, user, rememberMe: !!form.rememberMe });

      const role = user?.role || null;
      if (role === "admin") {
        navigate("/admin/dashboard");
        return;
      }

      if (phoneVerificationRecommended && !user?.isPhoneVerified) {
        navigate(`/verify-phone?next=${encodeURIComponent("/profile")}`);
        return;
      }

      navigate("/profile");
    } catch (err) {
      const msg = err?.data?.message || err?.message || "Login failed";
      setServerError(msg);
      if (err?.status === 403 && err?.data?.code === "EMAIL_NOT_VERIFIED") {
        setNeedsVerify(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    const email = form.email.trim().toLowerCase();
    if (!validateEmailFormat(email) || resendState.loading || cooldown > 0) return;
    setResendState({ loading: true, message: "", type: "" });
    try {
      const res = await resendVerification({ email });
      if (isDev && res?.debugVerifyUrl) setVerifyDebugLink(res.debugVerifyUrl);
      setCooldown(30);
      setResendState({ loading: false, message: "Verification email sent. Check your inbox (and spam folder).", type: "success" });
    } catch (err) {
      setResendState({ loading: false, message: err?.data?.message || err?.message || "Failed to resend verification email", type: "error" });
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-500 mt-1">Sign in to continue to HavenBridge</p>
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

          {needsVerify ? (
            <div className="mb-6 rounded-xl bg-amber-50 border border-amber-100 p-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold text-amber-800">Email not verified</span>
              </div>
              <p className="text-sm text-amber-700 mb-3">Please verify your email to sign in.</p>
              <button
                onClick={onResend}
                disabled={!validateEmailFormat(form.email) || resendState.loading || cooldown > 0}
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg 
                  bg-amber-600 text-white text-sm font-medium
                  hover:bg-amber-700 transition-colors
                  disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {resendState.loading ? "Sending…" : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend verification email"}
              </button>
              {resendState.message ? (
                <p className={`mt-2 text-xs ${resendState.type === "success" ? "text-green-700" : "text-red-700"}`}>
                  {resendState.message}
                </p>
              ) : null}
              {isDev && verifyDebugLink ? (
                <p className="mt-2 text-xs text-amber-900">
                  Dev link: <a className="underline" href={verifyDebugLink} target="_blank" rel="noreferrer">Open verify link</a>
                </p>
              ) : null}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3
                  text-gray-800 placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white
                  transition-all duration-200"
                autoComplete="email"
              />
              {errors.email ? <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.email}
              </p> : null}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Enter your password"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-12
                    text-gray-800 placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white
                    transition-all duration-200"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg
                    text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
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
              {errors.password ? <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.password}
              </p> : null}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={form.rememberMe}
                  onChange={(e) => setForm((f) => ({ ...f, rememberMe: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-teal-600 
                    focus:ring-teal-500 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                  Remember me
                </span>
              </label>
              <Link 
                className="text-sm text-teal-600 font-medium hover:text-teal-700 transition-colors" 
                to="/forgot-password"
              >
                Forgot password?
              </Link>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={!canSubmit}
              loading={loading}
            >
              {loading ? "Signing in…" : "Sign in"}
            </Button>

            <p className="text-sm text-gray-600 text-center">
              New here?{" "}
              <Link className="text-teal-600 font-semibold hover:text-teal-700 transition-colors" to="/signup">
                Create an account
              </Link>
            </p>

            <div className="pt-4">
              <div className="flex items-center gap-4">
                <div className="h-px bg-gray-200 flex-1" />
                <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">or continue with</span>
                <div className="h-px bg-gray-200 flex-1" />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button 
                  type="button"
                  disabled 
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                    border border-gray-200 bg-white text-gray-500 text-sm font-medium
                    hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>
                <button 
                  type="button"
                  disabled 
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                    border border-gray-200 bg-white text-gray-500 text-sm font-medium
                    hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
                  </svg>
                  Apple
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Footer text */}
        <p className="text-center text-xs text-gray-400 mt-6">
          By signing in, you agree to our{" "}
          <Link to="/terms" className="text-gray-500 hover:text-teal-600 transition-colors">Terms</Link>
          {" "}and{" "}
          <Link to="/privacy" className="text-gray-500 hover:text-teal-600 transition-colors">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
