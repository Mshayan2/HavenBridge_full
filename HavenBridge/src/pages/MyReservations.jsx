import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  listMyReservations,
  payRemainingBalance,
  resumeReservationFeePayment,
} from "../api/reservations";
import { 
  FaHome, FaSync, FaClock, FaCreditCard, FaCheckCircle, FaExclamationTriangle,
  FaHourglassHalf, FaMoneyBillWave, FaCalendarAlt, FaEye, FaInbox
} from "react-icons/fa";

function formatMoneyFromMinor(amountMinor, currency) {
  const cur = String(currency || "pkr").toUpperCase();
  const n = Number(amountMinor);
  if (!Number.isFinite(n)) return "—";
  const major = n / 100;
  try {
    return new Intl.NumberFormat("en-PK", { style: "currency", currency: cur }).format(major);
  } catch {
    return `${cur} ${major.toLocaleString()}`;
  }
}

function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

function getEffectiveStatus(r) {
  if (!r) return "—";
  const now = Date.now();
  const status = String(r.status || "");
  if (status === "pending_fee" && r.feeDueAt && new Date(r.feeDueAt).getTime() < now) return "expired";
  if (status === "active" && r.reservationExpiry && new Date(r.reservationExpiry).getTime() < now) return "expired";
  return status;
}

function countdownLabel(target) {
  if (!target) return null;
  const ms = new Date(target).getTime() - Date.now();
  if (!Number.isFinite(ms)) return null;
  if (ms <= 0) return "Expired";

  const totalSec = Math.floor(ms / 1000);
  const sec = totalSec % 60;
  const totalMin = Math.floor(totalSec / 60);
  const min = totalMin % 60;
  const totalHr = Math.floor(totalMin / 60);
  const hr = totalHr % 24;
  const days = Math.floor(totalHr / 24);

  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hr || days) parts.push(`${hr}h`);
  parts.push(`${min}m`);
  parts.push(`${sec}s`);
  return parts.join(" ");
}

function getStatusConfig(status) {
  const configs = {
    pending_fee: { bg: "bg-amber-100", text: "text-amber-800", icon: FaHourglassHalf, label: "Pending Fee" },
    active: { bg: "bg-blue-100", text: "text-blue-800", icon: FaClock, label: "Active" },
    expired: { bg: "bg-gray-100", text: "text-gray-600", icon: FaExclamationTriangle, label: "Expired" },
    completed: { bg: "bg-green-100", text: "text-green-800", icon: FaCheckCircle, label: "Completed" },
    cancelled: { bg: "bg-red-100", text: "text-red-800", icon: FaExclamationTriangle, label: "Cancelled" },
  };
  return configs[status] || { bg: "bg-gray-100", text: "text-gray-700", icon: FaClock, label: status };
}

export default function MyReservations() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listMyReservations();
      setReservations(Array.isArray(data) ? data : []);
    } catch (e) {
      const msg = e?.data?.message || e?.message || "Failed to load reservations";
      setError(msg);
      if (e?.status === 401 || String(msg).toLowerCase().includes("not authorized")) {
        navigate("/signin");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    load();
  }, [load]);

  // Tick every second for countdown UI
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const sorted = useMemo(() => {
    const list = Array.isArray(reservations) ? [...reservations] : [];
    list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return list;
  }, [reservations]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded-xl w-1/3" />
            <div className="h-40 bg-gray-200 rounded-2xl" />
            <div className="h-40 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <FaMoneyBillWave className="text-purple-600" />
              </span>
              My Reservations
            </h1>
            <p className="text-gray-500 mt-2 max-w-lg">
              Reserve a property by paying the reservation fee, then pay the remaining balance within the time window.
            </p>
          </div>
          <div className="flex gap-3">
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
            <Link
              to="/properties"
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 
                rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-300 
                transition-all duration-200 font-medium"
            >
              <FaHome />
              Browse
            </Link>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 
            flex items-start gap-3 animate-fade-in">
            <FaExclamationTriangle className="text-red-500 shrink-0 mt-0.5" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Empty State */}
        {sorted.length === 0 && !error && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaInbox className="text-4xl text-purple-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Reservations Yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              You haven't made any property reservations. Browse properties to start.
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
        )}

        {/* Reservations List */}
        {sorted.length > 0 && (
          <div className="space-y-4">
            {sorted.map((r) => {
              const status = getEffectiveStatus(r);
              const statusConfig = getStatusConfig(status);
              const StatusIcon = statusConfig.icon;
              const property = r?.property;
              const isBusy = busyId === r._id;

              const timerTarget =
                status === "pending_fee" ? r.feeDueAt : status === "active" ? r.reservationExpiry : null;

              return (
                <div
                  key={r._id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden
                    hover:shadow-xl transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                      {/* Left: Property & Status */}
                      <div className="flex-1">
                        {property?._id ? (
                          <Link
                            to={`/properties/${property._id}`}
                            className="text-xl font-semibold text-gray-800 hover:text-teal-600 
                              transition-colors flex items-center gap-2 group"
                          >
                            <FaHome className="text-teal-500 text-lg" />
                            {property?.title || "(Untitled property)"}
                            <span className="text-teal-500 opacity-0 group-hover:opacity-100 
                              transition-opacity">→</span>
                          </Link>
                        ) : (
                          <div className="text-xl font-semibold text-gray-400 flex items-center gap-2">
                            <FaHome />
                            Property not available
                          </div>
                        )}

                        {/* Status Badge */}
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold 
                            flex items-center gap-1.5 ${statusConfig.bg} ${statusConfig.text}`}>
                            <StatusIcon className="text-xs" />
                            {statusConfig.label}
                          </span>
                          
                          {timerTarget && (
                            <span className="px-3 py-1.5 rounded-full text-xs font-semibold 
                              bg-blue-100 text-blue-800 flex items-center gap-1.5">
                              <FaClock className="text-xs" />
                              {countdownLabel(timerTarget)}
                            </span>
                          )}
                        </div>

                        {/* Details */}
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FaCalendarAlt className="text-gray-400" />
                            <span>Created: {formatDateTime(r.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Financial Info */}
                      <div className="lg:text-right shrink-0 space-y-3">
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="text-sm text-gray-500 mb-1">Reservation Fee</div>
                          <div className="text-lg font-bold text-gray-800">
                            {formatMoneyFromMinor(r.reservationFee, r.currency)}
                          </div>
                        </div>
                        <div className="bg-teal-50 rounded-xl p-4">
                          <div className="text-sm text-teal-600 mb-1">Remaining Balance</div>
                          <div className="text-lg font-bold text-teal-700">
                            {formatMoneyFromMinor(r.remainingAmount, r.currency)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 pt-6 border-t border-gray-100 flex flex-wrap gap-3">
                      {status === "pending_fee" && (
                        <button
                          disabled={isBusy}
                          onClick={async () => {
                            setError("");
                            setBusyId(r._id);
                            try {
                              const out = await resumeReservationFeePayment(r._id);
                              if (out?.url) window.location.href = out.url;
                              else setError("Could not start checkout session.");
                            } catch (e) {
                              setError(e?.data?.message || e?.message || "Failed to start fee payment");
                            } finally {
                              setBusyId(null);
                            }
                          }}
                          className="inline-flex items-center gap-2 px-5 py-2.5 
                            bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl 
                            font-semibold hover:from-teal-700 hover:to-teal-800
                            transition-all duration-300 shadow-lg shadow-teal-500/25
                            disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FaCreditCard />
                          Pay Reservation Fee
                        </button>
                      )}

                      {status === "active" && (
                        <button
                          disabled={isBusy}
                          onClick={async () => {
                            setError("");
                            setBusyId(r._id);
                            try {
                              const out = await payRemainingBalance(r._id);
                              if (out?.url) window.location.href = out.url;
                              else setError("Could not start checkout session.");
                            } catch (e) {
                              setError(e?.data?.message || e?.message || "Failed to start remaining payment");
                            } finally {
                              setBusyId(null);
                            }
                          }}
                          className="inline-flex items-center gap-2 px-5 py-2.5 
                            bg-gray-900 text-white rounded-xl font-semibold
                            hover:bg-gray-800 transition-all duration-300
                            disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FaMoneyBillWave />
                          Pay Remaining Balance
                        </button>
                      )}

                      {status === "expired" && (
                        <div className="px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 
                          text-amber-800 text-sm flex items-start gap-2">
                          <FaExclamationTriangle className="shrink-0 mt-0.5" />
                          <span>Reservation expired. If the reservation fee was paid, it is non-refundable.</span>
                        </div>
                      )}

                      {status === "completed" && (
                        <div className="px-4 py-3 rounded-xl bg-green-50 border border-green-200 
                          text-green-800 text-sm flex items-center gap-2">
                          <FaCheckCircle />
                          <span>Completed. Property purchase finalized.</span>
                        </div>
                      )}

                      {property?._id && (
                        <Link
                          to={`/properties/${property._id}`}
                          className="inline-flex items-center gap-2 px-4 py-2.5 
                            border border-gray-200 rounded-xl text-gray-700 font-medium
                            hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                        >
                          <FaEye />
                          View Property
                        </Link>
                      )}
                    </div>

                    {isBusy && (
                      <div className="mt-3 text-sm text-gray-500 flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-teal-600 
                          rounded-full animate-spin" />
                        Opening checkout…
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
