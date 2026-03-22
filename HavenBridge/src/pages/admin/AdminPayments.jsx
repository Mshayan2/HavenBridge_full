import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminListPayments, adminRecordManualIncoming, adminReleasePayment, adminReleaseNonStripePayment } from "../../api/payments";
import { 
  FaCreditCard, FaSync, FaExclamationTriangle, FaMoneyBillWave, FaCheckCircle, 
  FaClock, FaSearch, FaInbox, FaFileInvoice, FaUniversity, FaStripe
} from "react-icons/fa";

const getStatusConfig = (status) => {
  const configs = {
    paid: { bg: "bg-green-100", text: "text-green-700", icon: FaCheckCircle },
    pending: { bg: "bg-amber-100", text: "text-amber-700", icon: FaClock },
    released: { bg: "bg-blue-100", text: "text-blue-700", icon: FaCheckCircle },
    failed: { bg: "bg-red-100", text: "text-red-700", icon: FaExclamationTriangle },
  };
  return configs[status] || configs.pending;
};

export default function AdminPayments() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [manual, setManual] = useState({
    bookingId: "",
    amount: "",
    currency: "pkr",
    method: "RTGS",
    reference: "",
    notes: "",
    markReleased: false,
  });

  const me = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await adminListPayments();
      setPayments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      const msg = e?.data?.message || e?.message || "Failed to load payments";
      setError(msg);
      if (String(msg).toLowerCase().includes("not authorized") || String(msg).includes("401")) {
        navigate("/signin");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!me || me?.role !== "admin") navigate("/signin");
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onRelease(id) {
    const ok = window.confirm("Release this payment to the seller via Stripe transfer?");
    if (!ok) return;
    setError("");
    try {
      await adminReleasePayment(id);
      await load();
    } catch (e) {
      console.error(e);
      setError(e?.data?.message || e?.message || "Failed to release payment");
    }
  }

  async function onReleaseNonStripe(id) {
    const ok = window.confirm("Release this non-Stripe payment to the seller (manual payout)?");
    if (!ok) return;
    setError("");
    try {
      await adminReleaseNonStripePayment(id);
      await load();
    } catch (e) {
      console.error(e);
      setError(e?.data?.message || e?.message || "Failed to release non-Stripe payment");
    }
  }

  async function onManualSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await adminRecordManualIncoming({
        ...manual,
        amount: Number(manual.amount),
      });
      setManual({ 
        bookingId: "", 
        amount: "", 
        currency: manual.currency, 
        method: manual.method, 
        reference: "", 
        notes: "", 
        markReleased: false 
      });
      await load();
    } catch (e2) {
      console.error(e2);
      setError(e2?.data?.message || e2?.message || "Failed to record manual payment");
    }
  }

  const filteredPayments = payments.filter(p => {
    const term = searchTerm.toLowerCase();
    return (p.purpose || "").toLowerCase().includes(term) || 
           (p.provider || "").toLowerCase().includes(term);
  });

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <FaCreditCard className="text-emerald-600" />
              </span>
              Admin — Payments
            </h1>
            <p className="text-gray-500 mt-2">Review incoming payments and release to sellers.</p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 
              bg-gray-900 text-white rounded-xl font-medium
              hover:bg-gray-800 transition-all duration-200
              disabled:opacity-50"
          >
            <FaSync className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 
            flex items-start gap-3 animate-fade-in">
            <FaExclamationTriangle className="text-red-500 shrink-0 mt-0.5" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payments Table */}
          <div className="lg:col-span-2">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by purpose or provider..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl
                    focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
                    transition-all duration-200 outline-none"
                />
              </div>
            </div>

            {loading ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaInbox className="text-4xl text-emerald-300" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Payments Found</h3>
                <p className="text-gray-500">
                  {searchTerm ? "Try a different search term." : "No payments recorded yet."}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Purpose
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Provider
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredPayments.map((p) => {
                        const statusConfig = getStatusConfig(p.status);
                        const StatusIcon = statusConfig.icon;
                        return (
                          <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-medium text-gray-900">{p.purpose}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-semibold text-gray-900">
                                {p.currency?.toUpperCase()} {p.amount?.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
                                ${p.provider === 'stripe' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                                {p.provider === 'stripe' ? <FaStripe /> : <FaUniversity />}
                                {p.provider}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                                ${statusConfig.bg} ${statusConfig.text}`}>
                                <StatusIcon className="text-xs" />
                                {p.status?.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {p.status === "paid" && (
                                p.provider === "stripe" ? (
                                  <button 
                                    onClick={() => onRelease(p._id)} 
                                    className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 
                                      rounded-lg hover:bg-teal-700 transition-colors"
                                  >
                                    Release (Stripe)
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => onReleaseNonStripe(p._id)} 
                                    className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 
                                      rounded-lg hover:bg-orange-700 transition-colors"
                                  >
                                    Release (Manual)
                                  </button>
                                )
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Manual Payment Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden sticky top-24">
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-5">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FaFileInvoice />
                  Record Manual Payment
                </h2>
                <p className="text-gray-400 text-xs mt-1">
                  For RTGS/NEFT/cash transactions
                </p>
              </div>

              <form onSubmit={onManualSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Booking ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5
                      focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
                      transition-all duration-200 outline-none"
                    value={manual.bookingId}
                    onChange={(e) => setManual({ ...manual, bookingId: e.target.value })}
                    placeholder="Mongo booking _id"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (minor units) <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5
                      focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
                      transition-all duration-200 outline-none"
                    value={manual.amount}
                    onChange={(e) => setManual({ ...manual, amount: e.target.value })}
                    placeholder="e.g. 5000"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                    <input
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5
                        focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
                        transition-all duration-200 outline-none"
                      value={manual.currency}
                      onChange={(e) => setManual({ ...manual, currency: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                    <input
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5
                        focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
                        transition-all duration-200 outline-none"
                      value={manual.method}
                      onChange={(e) => setManual({ ...manual, method: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                  <input
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5
                      focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
                      transition-all duration-200 outline-none"
                    value={manual.reference}
                    onChange={(e) => setManual({ ...manual, reference: e.target.value })}
                    placeholder="Bank reference / UTR"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5
                      focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
                      transition-all duration-200 outline-none resize-none"
                    rows={3}
                    value={manual.notes}
                    onChange={(e) => setManual({ ...manual, notes: e.target.value })}
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={manual.markReleased}
                    onChange={(e) => setManual({ ...manual, markReleased: e.target.checked })}
                    className="h-5 w-5 text-emerald-600 border-gray-300 rounded 
                      focus:ring-emerald-500 transition-colors cursor-pointer"
                  />
                  <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                    Mark as released to seller
                  </span>
                </label>

                <button 
                  type="submit"
                  className="w-full py-3 px-4 bg-gray-900 text-white rounded-xl font-semibold
                    hover:bg-gray-800 transition-colors"
                >
                  Record Payment
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
