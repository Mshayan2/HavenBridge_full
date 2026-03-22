import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSync } from "react-icons/fa";

export default function SellerStripeRefresh() {
  const navigate = useNavigate();

  useEffect(() => {
    // Stripe uses refresh_url if the user needs to restart onboarding.
    const timer = setTimeout(() => {
      navigate("/seller/stripe", { replace: true });
    }, 1500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <FaSync className="text-3xl text-amber-600 animate-spin" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Refreshing Onboarding</h1>
        <p className="text-gray-500">
          Please wait while we redirect you back to continue your Stripe setup...
        </p>
      </div>
    </div>
  );
}
