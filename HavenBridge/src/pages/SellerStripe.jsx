import React, { useEffect, useState } from "react";
import { sellerConnectOnboard, sellerConnectStatus } from "../api/payments";
import { useNavigate, Link } from "react-router-dom";
import { 
  FaCreditCard, FaSync, FaCheckCircle, FaTimesCircle, FaClock, 
  FaExclamationTriangle, FaExternalLinkAlt, FaWallet, FaInfoCircle
} from "react-icons/fa";

export default function SellerStripe() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");
  const [onboardingLoading, setOnboardingLoading] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const s = await sellerConnectStatus();
      setStatus(s);
    } catch (e) {
      console.error(e);
      const msg = e?.data?.message || e?.message || "Failed to load Stripe status";
      setError(msg);
      if (String(msg).toLowerCase().includes("not authorized")) navigate("/signin");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startOnboarding() {
    setError("");
    setOnboardingLoading(true);
    try {
      const res = await sellerConnectOnboard();
      if (res?.url) {
        window.location.assign(res.url);
      } else {
        setError("Failed to start onboarding (missing URL).");
      }
    } catch (e) {
      console.error(e);
      setError(e?.data?.message || e?.message || "Failed to start onboarding");
    } finally {
      setOnboardingLoading(false);
    }
  }

  const StatusItem = ({ label, value, icon: Icon, isPositive }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <span className="text-gray-600 flex items-center gap-2">
        <Icon className="text-gray-400" />
        {label}
      </span>
      <span className={`font-semibold flex items-center gap-1.5 
        ${isPositive ? "text-green-600" : "text-amber-600"}`}>
        {isPositive ? <FaCheckCircle className="text-sm" /> : <FaClock className="text-sm" />}
        {value}
      </span>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <FaWallet className="text-purple-600" />
            </span>
            Seller Payouts
          </h1>
          <p className="text-gray-500 mt-2 max-w-xl">
            Connect your Stripe account to receive payouts when an admin approves payments for your sold properties.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 
            flex items-start gap-3 animate-fade-in">
            <FaExclamationTriangle className="text-red-500 shrink-0 mt-0.5" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/3" />
              <div className="space-y-3">
                <div className="h-12 bg-gray-100 rounded-xl" />
                <div className="h-12 bg-gray-100 rounded-xl" />
                <div className="h-12 bg-gray-100 rounded-xl" />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Status Header */}
            <div className={`px-6 py-5 ${status?.payoutsEnabled ? "bg-gradient-to-r from-green-500 to-emerald-600" : "bg-gradient-to-r from-purple-500 to-indigo-600"}`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <FaCreditCard className="text-2xl text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {status?.payoutsEnabled ? "Payouts Enabled" : "Setup Required"}
                  </h2>
                  <p className="text-white/80 text-sm">
                    {status?.payoutsEnabled 
                      ? "Your account is ready to receive payments" 
                      : "Complete Stripe onboarding to receive payments"}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Details */}
            <div className="p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Account Status
              </h3>
              <div className="bg-gray-50 rounded-xl p-4">
                <StatusItem 
                  label="Stripe Account" 
                  value={status?.hasAccount ? status.accountId?.slice(-8) || "Created" : "Not created"} 
                  icon={FaCreditCard}
                  isPositive={status?.hasAccount}
                />
                <StatusItem 
                  label="Onboarding" 
                  value={status?.onboardingComplete ? "Complete" : "Incomplete"} 
                  icon={FaCheckCircle}
                  isPositive={status?.onboardingComplete}
                />
                <StatusItem 
                  label="Payouts" 
                  value={status?.payoutsEnabled ? "Enabled" : "Disabled"} 
                  icon={FaWallet}
                  isPositive={status?.payoutsEnabled}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={startOnboarding}
                  disabled={onboardingLoading}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 
                    bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl 
                    font-semibold hover:from-teal-700 hover:to-teal-800
                    transition-all duration-300 shadow-lg shadow-teal-500/25
                    disabled:opacity-50"
                >
                  {onboardingLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Redirecting...
                    </>
                  ) : (
                    <>
                      <FaExternalLinkAlt />
                      {status?.hasAccount ? "Continue Onboarding" : "Start Onboarding"}
                    </>
                  )}
                </button>
                <button 
                  onClick={load} 
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 
                    border border-gray-200 rounded-xl text-gray-700 font-medium
                    hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <FaSync className={loading ? "animate-spin" : ""} />
                  Refresh Status
                </button>
              </div>
            </div>

            {/* Info Note */}
            <div className="px-6 pb-6">
              <div className="flex items-start gap-3 text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded-xl p-4">
                <FaInfoCircle className="text-blue-500 shrink-0 mt-0.5" />
                <span>
                  In Stripe test mode, you can complete onboarding with test details. Payouts are simulated and no real money is transferred.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Help Text */}
        <p className="text-center text-sm text-gray-400 mt-8">
          Having trouble? Contact our{" "}
          <Link to="/contact" className="text-teal-600 hover:underline">
            support team
          </Link>
        </p>
      </div>
    </div>
  );
}
