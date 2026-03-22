import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";

export default function SellerStripeReturn() {
  const navigate = useNavigate();

  useEffect(() => {
    // After Stripe redirects back, send user to the status page.
    const timer = setTimeout(() => {
      navigate("/seller/stripe", { replace: true });
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-bounce">
          <FaCheckCircle className="text-3xl text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back!</h1>
        <p className="text-gray-500 mb-2">
          Returning from Stripe onboarding...
        </p>
        <p className="text-sm text-gray-400">
          Redirecting you to your account status page.
        </p>
      </div>
    </div>
  );
}
