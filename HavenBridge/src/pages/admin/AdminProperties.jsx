import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminDeleteProperty, adminGetProperties, adminApproveProperty, adminRejectProperty, adminUpdateReservationPolicy, adminUpdateRentalPolicy } from "../../api/admin";
import PropertyPreviewModal from "../../components/PropertyPreviewModal";
import { 
  FaHome, FaSync, FaExclamationTriangle, FaCheckCircle, FaTimesCircle, 
  FaClock, FaTrash, FaCog, FaSearch, FaInbox, FaEye, FaMapMarkerAlt
} from "react-icons/fa";

export default function AdminProperties() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

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
      const res = await adminGetProperties();
      const list = Array.isArray(res?.data) ? res.data : (res?.data?.properties || []);
      setProperties(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error("AdminProperties load error:", e);
      const status = e?.status || e?.response?.status || null;
      const body = e?.data || e?.response?.data || null;
      const msg = (body && (body.message || JSON.stringify(body))) || e?.message || "Failed to load properties.";
      setError(status ? `${status} — ${msg}` : msg);
      if (String(msg).includes("401") || String(msg).toLowerCase().includes("unauthorized")) {
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

  async function onDelete(id) {
    const ok = window.confirm("Delete this property? This can't be undone.");
    if (!ok) return;
    setError("");
    try {
      await adminDeleteProperty(id);
      await load();
    } catch (e) {
      setError(e?.message || "Failed to delete property.");
    }
  }

  async function onApprove(id) {
    const ok = window.confirm("Approve this property for listing?");
    if (!ok) return;
    setError("");
    try {
      await adminApproveProperty(id);
      await load();
    } catch (e) {
      setError(e?.message || "Failed to approve property.");
    }
  }

  async function onReject(id) {
    const reason = window.prompt("Reason for rejection:") || "Rejected by admin";
    const ok = window.confirm("Reject this property?");
    if (!ok) return;
    setError("");
    try {
      await adminRejectProperty(id, reason);
      await load();
    } catch (e) {
      setError(e?.message || "Failed to reject property.");
    }
  }

  async function onEditReservationPolicy(p) {
    try {
      const currentEnabled = p?.reservation?.enabled !== false;
      const currentTokenRequired = Boolean(p?.reservation?.tokenRequired);
      const currentCurrency = String(p?.reservation?.currency || "pkr").toLowerCase();
      const currentAmountMinor = p?.reservation?.tokenAmountMinor ?? "";

      const enabledStr = window.prompt("Reservations enabled? (yes/no)", currentEnabled ? "yes" : "no");
      if (enabledStr === null) return;
      const tokenReqStr = window.prompt("Token required to reserve? (yes/no)", currentTokenRequired ? "yes" : "no");
      if (tokenReqStr === null) return;

      const enabled = String(enabledStr).trim().toLowerCase().startsWith("y");
      const tokenRequired = String(tokenReqStr).trim().toLowerCase().startsWith("y");

      let tokenAmountMinor;
      if (tokenRequired) {
        const amt = window.prompt(
          "Token amount (minor units). Example: 500000 = PKR 5,000.00",
          String(currentAmountMinor || "")
        );
        if (amt === null) return;
        tokenAmountMinor = Number(amt);
        if (!Number.isFinite(tokenAmountMinor) || tokenAmountMinor <= 0) {
          window.alert("Please enter a valid positive number for tokenAmountMinor.");
          return;
        }
      }

      const currency = window.prompt("Currency (e.g. pkr)", currentCurrency);
      if (currency === null) return;

      await adminUpdateReservationPolicy(p._id, {
        enabled,
        tokenRequired,
        ...(tokenRequired ? { tokenAmountMinor: Math.trunc(tokenAmountMinor) } : { tokenAmountMinor: 0 }),
        currency: String(currency).toLowerCase().trim() || "pkr",
      });
      await load();
    } catch (e) {
      console.error("Update reservation policy error:", e);
      window.alert(e?.message || "Failed to update reservation policy");
    }
  }

  async function onEditRentalPolicy(p) {
    try {
      const currentEnabled = Boolean(p?.rental?.enabled);
      const currentCurrency = String(p?.rental?.currency || "pkr").toLowerCase();
      const currentMonthly = p?.rental?.monthlyRentMinor ?? "";
      const currentDeposit = p?.rental?.depositMinor ?? "";
      const currentMinTerm = p?.rental?.minTermMonths ?? "";

      const enabledStr = window.prompt("Rent/lease enabled? (yes/no)", currentEnabled ? "yes" : "no");
      if (enabledStr === null) return;
      const enabled = String(enabledStr).trim().toLowerCase().startsWith("y");

      let monthlyRentMinor = 0;
      let depositMinor = 0;
      let minTermMonths = 6;

      if (enabled) {
        const monthlyStr = window.prompt(
          "Monthly rent (minor units). Example: 250000 = PKR 2,500.00",
          String(currentMonthly || "")
        );
        if (monthlyStr === null) return;
        monthlyRentMinor = Number(monthlyStr);
        if (!Number.isFinite(monthlyRentMinor) || monthlyRentMinor <= 0) {
          window.alert("Please enter a valid positive number for monthlyRentMinor.");
          return;
        }

        const depositStr = window.prompt(
          "Deposit (minor units). Example: 500000 = PKR 5,000.00 (0 for none)",
          String(currentDeposit || "0")
        );
        if (depositStr === null) return;
        depositMinor = Number(depositStr);
        if (!Number.isFinite(depositMinor) || depositMinor < 0) {
          window.alert("Please enter a valid non-negative number for depositMinor.");
          return;
        }

        const minTermStr = window.prompt("Minimum term (months)", String(currentMinTerm || "6"));
        if (minTermStr === null) return;
        minTermMonths = Number(minTermStr);
        if (!Number.isFinite(minTermMonths) || minTermMonths < 1 || minTermMonths > 120) {
          window.alert("minTermMonths must be between 1 and 120.");
          return;
        }
      }

      const currency = window.prompt("Currency (e.g. pkr)", currentCurrency);
      if (currency === null) return;

      await adminUpdateRentalPolicy(p._id, {
        enabled,
        ...(enabled ? { monthlyRentMinor: Math.trunc(monthlyRentMinor) } : { monthlyRentMinor: 0 }),
        ...(enabled ? { depositMinor: Math.trunc(depositMinor) } : { depositMinor: 0 }),
        ...(enabled ? { minTermMonths: Math.trunc(minTermMonths) } : { minTermMonths: 6 }),
        currency: String(currency).toLowerCase().trim() || "pkr",
      });

      await load();
    } catch (e) {
      console.error("Update rental policy error:", e);
      window.alert(e?.response?.data?.message || e?.message || "Failed to update rental policy");
    }
  }

  const getStatusConfig = (status) => {
    const configs = {
      approved: { bg: "bg-green-100", text: "text-green-700", icon: FaCheckCircle },
      pending: { bg: "bg-amber-100", text: "text-amber-700", icon: FaClock },
      rejected: { bg: "bg-red-100", text: "text-red-700", icon: FaTimesCircle },
    };
    return configs[status] || configs.pending;
  };

  const filteredProperties = properties.filter(p => {
    const term = searchTerm.toLowerCase();
    return (p.title || "").toLowerCase().includes(term) || 
           (p.location || "").toLowerCase().includes(term);
  });

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                <FaHome className="text-teal-600" />
              </span>
              Admin — Properties
            </h1>
            <p className="text-gray-500 mt-2">Manage, approve, and configure property listings.</p>
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

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl
                focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500
                transition-all duration-200 outline-none"
            />
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaInbox className="text-4xl text-teal-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Properties Found</h3>
            <p className="text-gray-500">
              {searchTerm ? "Try a different search term." : "No properties submitted yet."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Type
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
                  {filteredProperties.map((p) => {
                    const approvalStatus = p.approval?.status || 'pending';
                    const statusConfig = getStatusConfig(approvalStatus);
                    const StatusIcon = statusConfig.icon;
                    const isDisabled = ['rented', 'sold'].includes(String(p.status || '').toLowerCase());

                    return (
                      <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => setPreview(p)} 
                            className="flex items-start gap-3 text-left group"
                          >
                            <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                              <FaHome className="text-gray-400" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-1">
                                {p.title || "—"}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                <FaMapMarkerAlt className="text-xs" />
                                {p.location || p.address || "—"}
                              </div>
                            </div>
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-900">
                            {p.price ? `PKR ${p.price?.toLocaleString?.() || p.price}` : "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                            {p.type || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                            ${statusConfig.bg} ${statusConfig.text}`}>
                            <StatusIcon className="text-xs" />
                            {((p.status && String(p.status).toLowerCase() !== 'available')
                              ? String(p.status)
                              : approvalStatus).toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button 
                              onClick={() => setPreview(p)} 
                              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 
                                rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
                            >
                              <FaEye /> View
                            </button>
                            <button 
                              onClick={() => onEditReservationPolicy(p)} 
                              className="px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 
                                rounded-lg hover:bg-teal-100 transition-colors flex items-center gap-1"
                            >
                              <FaCog /> Reserve
                            </button>
                            <button 
                              onClick={() => onEditRentalPolicy(p)}
                              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1
                                ${p?.rental?.enabled 
                                  ? "text-white bg-purple-600 hover:bg-purple-700" 
                                  : "text-purple-700 bg-purple-50 hover:bg-purple-100"}`}
                              title={p?.rental?.enabled ? `Rent enabled` : "Rent disabled"}
                            >
                              <FaCog /> Rent
                            </button>
                            {approvalStatus === 'pending' && (
                              <>
                                <button
                                  onClick={() => onApprove(p._id)}
                                  disabled={isDisabled}
                                  className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 
                                    rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50
                                    flex items-center gap-1"
                                >
                                  <FaCheckCircle /> Approve
                                </button>
                                <button 
                                  onClick={() => onReject(p._id)} 
                                  className="px-3 py-1.5 text-xs font-medium text-white bg-amber-500 
                                    rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-1"
                                >
                                  <FaTimesCircle /> Reject
                                </button>
                              </>
                            )}
                            <button 
                              onClick={() => onDelete(p._id)} 
                              disabled={isDisabled}
                              className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 
                                rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50
                                flex items-center gap-1"
                            >
                              <FaTrash /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer Stats */}
        <div className="mt-6 text-center text-sm text-gray-400">
          {filteredProperties.length} propert{filteredProperties.length !== 1 ? "ies" : "y"} total
        </div>
      </div>

      {/* Preview Modal */}
      {preview && (
        <PropertyPreviewModal
          property={preview}
          onClose={() => setPreview(null)}
          onApprove={async (id) => { await onApprove(id); setPreview(null); }}
          onReject={async (id) => { await onReject(id); setPreview(null); }}
          onDelete={async (id) => { await onDelete(id); setPreview(null); }}
          onEditReservationPolicy={async (p) => { await onEditReservationPolicy(p); setPreview(null); }}
        />
      )}
    </div>
  );
}
