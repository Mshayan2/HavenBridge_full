import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { approveLease, createLeaseCheckoutSession, getLandlordLeases, getMyLeases, rejectLease } from "../api/leases";
import { 
  FaFileContract, FaSync, FaHome, FaUser, FaCalendarAlt, FaCreditCard,
  FaCheckCircle, FaTimesCircle, FaClock, FaExclamationTriangle, FaInbox,
  FaMoneyBillWave, FaUserTie
} from "react-icons/fa";

function moneyMinor(amountMinor, currency = "pkr") {
  const amt = Number(amountMinor ?? 0);
  const cur = String(currency || "pkr").toUpperCase();
  if (!Number.isFinite(amt)) return `${cur} —`;
  return `${cur} ${amt.toLocaleString()}`;
}

function formatDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString();
}

export default function Leases() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("tenant");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [myLeases, setMyLeases] = useState([]);
  const [landlordLeases, setLandlordLeases] = useState([]);

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
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/signin", { replace: true });
        return;
      }

      const [mine, landlord] = await Promise.all([getMyLeases(), getLandlordLeases()]);
      setMyLeases(Array.isArray(mine) ? mine : []);
      setLandlordLeases(Array.isArray(landlord) ? landlord : []);

      const pending = (Array.isArray(landlord) ? landlord : []).some((l) => String(l.status) === "pending");
      if (pending) setTab("landlord");
    } catch (e) {
      console.error("Leases load error:", e);
      const status = e?.status || e?.response?.status || null;
      const body = e?.data || e?.response?.data || null;
      const msg = (body && (body.message || JSON.stringify(body))) || e?.message || "Failed to load leases.";
      setError(status ? `${status} — ${msg}` : msg);
      if (String(status) === "401") navigate("/signin", { replace: true });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onPay(leaseId, installmentId) {
    try {
      const res = await createLeaseCheckoutSession(leaseId, installmentId);
      if (res?.url) window.location.assign(res.url);
      else window.alert("No checkout URL returned.");
    } catch (e) {
      console.error("Pay installment error:", e);
      window.alert(e?.data?.message || e?.message || "Failed to start payment");
    }
  }

  async function onApprove(lease) {
    try {
      const startDate = window.prompt("Start date (YYYY-MM-DD)", lease?.startDate ? String(lease.startDate).slice(0, 10) : "");
      if (startDate === null) return;
      const termMonths = window.prompt("Term months", String(lease?.termMonths || ""));
      if (termMonths === null) return;

      await approveLease(lease._id, { startDate, termMonths });
      await load();
    } catch (e) {
      console.error("Approve lease error:", e);
      window.alert(e?.data?.message || e?.message || "Failed to approve lease");
    }
  }

  async function onReject(lease) {
    try {
      const reason = window.prompt("Reason for rejection", "Not a fit") || "Rejected";
      const ok = window.confirm("Reject this lease request?");
      if (!ok) return;
      await rejectLease(lease._id, reason);
      await load();
    } catch (e) {
      console.error("Reject lease error:", e);
      window.alert(e?.data?.message || e?.message || "Failed to reject lease");
    }
  }

  const tenantCount = myLeases.length;
  const landlordCount = landlordLeases.length;
  const pendingCount = landlordLeases.filter(l => l.status === "pending").length;

  const getStatusConfig = (status) => {
    const configs = {
      active: { bg: "bg-green-100", text: "text-green-800", icon: FaCheckCircle },
      pending: { bg: "bg-amber-100", text: "text-amber-800", icon: FaClock },
      rejected: { bg: "bg-red-100", text: "text-red-800", icon: FaTimesCircle },
      completed: { bg: "bg-blue-100", text: "text-blue-800", icon: FaCheckCircle },
    };
    return configs[status] || { bg: "bg-gray-100", text: "text-gray-700", icon: FaClock };
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                <FaFileContract className="text-indigo-600" />
              </span>
              Leases
            </h1>
            <p className="text-gray-500 mt-2">Manage your lease requests and rent payments.</p>
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

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            type="button"
            onClick={() => setTab("tenant")}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
              flex items-center gap-2 ${
                tab === "tenant" 
                  ? "bg-teal-600 text-white shadow-lg shadow-teal-500/25" 
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
          >
            <FaUser />
            As Tenant
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              tab === "tenant" ? "bg-white/20" : "bg-gray-100"
            }`}>
              {tenantCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setTab("landlord")}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
              flex items-center gap-2 ${
                tab === "landlord" 
                  ? "bg-teal-600 text-white shadow-lg shadow-teal-500/25" 
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
          >
            <FaUserTie />
            As Landlord
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              tab === "landlord" ? "bg-white/20" : "bg-gray-100"
            }`}>
              {landlordCount}
            </span>
            {pendingCount > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-red-500 text-white">
                {pendingCount} new
              </span>
            )}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tenant Tab */}
        {!loading && tab === "tenant" && (
          <div className="space-y-4">
            {myLeases.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaInbox className="text-4xl text-indigo-300" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Leases Yet</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Browse properties and request a lease on rent-enabled listings.
                </p>
                <Link
                  to="/properties"
                  className="inline-flex items-center gap-2 px-6 py-3 
                    bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl 
                    font-semibold hover:from-teal-700 hover:to-teal-800
                    transition-all duration-300 shadow-lg shadow-teal-500/25"
                >
                  <FaHome />
                  Browse Properties
                </Link>
              </div>
            ) : (
              myLeases.map((l) => {
                const statusConfig = getStatusConfig(l.status);
                const StatusIcon = statusConfig.icon;
                return (
                  <div key={l._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                            <FaHome className="text-indigo-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {l.property?.title || "Property"}
                            </h3>
                            <p className="text-sm text-gray-500">{l.property?.location}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold 
                          flex items-center gap-1.5 ${statusConfig.bg} ${statusConfig.text}`}>
                          <StatusIcon className="text-xs" />
                          {String(l.status || "").toUpperCase()}
                        </span>
                      </div>

                      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-xl p-3">
                          <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                            <FaCalendarAlt className="text-xs" /> Start Date
                          </div>
                          <div className="font-semibold text-gray-800">{formatDate(l.startDate)}</div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                          <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                            <FaCalendarAlt className="text-xs" /> End Date
                          </div>
                          <div className="font-semibold text-gray-800">{formatDate(l.endDate)}</div>
                        </div>
                        <div className="bg-teal-50 rounded-xl p-3">
                          <div className="text-xs text-teal-600 mb-1 flex items-center gap-1">
                            <FaMoneyBillWave className="text-xs" /> Monthly Rent
                          </div>
                          <div className="font-bold text-teal-700">{moneyMinor(l.monthlyRentMinor, l.currency)}</div>
                        </div>
                      </div>

                      {String(l.status) === "active" && (l.installments || []).length > 0 && (
                        <div className="mt-6 pt-6 border-t border-gray-100">
                          <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <FaCreditCard className="text-gray-400" />
                            Installments
                          </h4>
                          <div className="space-y-3">
                            {(l.installments || []).slice(0, 12).map((inst) => {
                              const isPaid = String(inst.status) === "paid";
                              return (
                                <div key={inst._id} className={`flex items-center justify-between gap-4 
                                  rounded-xl px-4 py-3 border ${isPaid ? "bg-green-50 border-green-100" : "bg-white border-gray-200"}`}>
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {inst.kind === "deposit" ? "🔒 Deposit" : "📅 Rent"} — {moneyMinor(inst.amountMinor, inst.currency)}
                                    </div>
                                    <div className="text-xs text-gray-500">Due: {formatDate(inst.dueDate)}</div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                                      ${isPaid ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                                      {String(inst.status || "").toUpperCase()}
                                    </span>
                                    {String(inst.status) === "due" && (
                                      <button
                                        type="button"
                                        onClick={() => onPay(l._id, inst._id)}
                                        className="px-4 py-2 text-sm rounded-lg bg-teal-600 text-white 
                                          hover:bg-teal-700 transition-colors font-medium"
                                      >
                                        Pay Now
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          {(l.installments || []).length > 12 && (
                            <p className="text-xs text-gray-500 mt-3">Showing first 12 installments.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Landlord Tab */}
        {!loading && tab === "landlord" && (
          <div className="space-y-4">
            {landlordLeases.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaUserTie className="text-4xl text-indigo-300" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Lease Requests</h3>
                <p className="text-gray-500">No one has requested a lease on your properties yet.</p>
              </div>
            ) : (
              landlordLeases.map((l) => {
                const statusConfig = getStatusConfig(l.status);
                const StatusIcon = statusConfig.icon;
                return (
                  <div key={l._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                            <FaUser className="text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {l.property?.title || "Property"}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Tenant: {l.tenant?.name || l.tenant?.email || "—"}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Requested: {formatDate(l.requestedAt)}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold 
                          flex items-center gap-1.5 ${statusConfig.bg} ${statusConfig.text}`}>
                          <StatusIcon className="text-xs" />
                          {String(l.status || "").toUpperCase()}
                        </span>
                      </div>

                      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-xl p-3">
                          <div className="text-xs text-gray-500 mb-1">Start Date</div>
                          <div className="font-semibold text-gray-800">{formatDate(l.startDate)}</div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                          <div className="text-xs text-gray-500 mb-1">Term</div>
                          <div className="font-semibold text-gray-800">{l.termMonths || "—"} month(s)</div>
                        </div>
                        <div className="bg-teal-50 rounded-xl p-3">
                          <div className="text-xs text-teal-600 mb-1">Monthly Rent</div>
                          <div className="font-bold text-teal-700">{moneyMinor(l.monthlyRentMinor, l.currency)}</div>
                        </div>
                      </div>

                      {String(l.status) === "pending" && (
                        <div className="mt-6 pt-6 border-t border-gray-100 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => onApprove(l)}
                            className="px-5 py-2.5 rounded-xl bg-green-600 text-white font-semibold
                              hover:bg-green-700 transition-colors flex items-center gap-2"
                          >
                            <FaCheckCircle />
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => onReject(l)}
                            className="px-5 py-2.5 rounded-xl bg-amber-500 text-white font-semibold
                              hover:bg-amber-600 transition-colors flex items-center gap-2"
                          >
                            <FaTimesCircle />
                            Reject
                          </button>
                          <Link
                            to={`/properties/${l.property?._id}`}
                            className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium
                              hover:bg-gray-50 transition-colors flex items-center gap-2"
                          >
                            <FaHome />
                            View Property
                          </Link>
                        </div>
                      )}

                      {String(l.status) !== "pending" && (
                        <div className="mt-4 text-sm text-gray-500">
                          {String(l.status) === "active" 
                            ? "✅ Lease is active" 
                            : "No actions available"}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-400">
          Signed in as: {me?.email || me?.name || "—"}
        </div>
      </div>
    </div>
  );
}
