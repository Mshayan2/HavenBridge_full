import React, { useEffect, useState } from "react";
import { getMyNotifications, markAllNotificationsRead, markNotificationRead } from "../api/notifications";
import { useNavigate } from "react-router-dom";
import { 
  FaBell, FaSync, FaCheckDouble, FaCheck, FaExclamationTriangle, 
  FaCalendarAlt, FaCreditCard, FaHome, FaInfoCircle, FaInbox 
} from "react-icons/fa";

export default function Notifications() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await getMyNotifications({ includeRead: true, limit: 100 });
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      const msg = e?.data?.message || e?.message || "Failed to load notifications";
      setError(msg);
      if (String(msg).toLowerCase().includes("not authorized") || String(msg).includes("401")) {
        navigate("/signin");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onRead(id) {
    try {
      await markNotificationRead(id);
      await load();
    } catch (e) {
      console.error(e);
      setError(e?.data?.message || e?.message || "Failed to mark read");
    }
  }

  async function onReadAll() {
    try {
      await markAllNotificationsRead();
      await load();
    } catch (e) {
      console.error(e);
      setError(e?.data?.message || e?.message || "Failed to mark all read");
    }
  }

  const getNotificationIcon = (type) => {
    const icons = {
      booking_created: FaCalendarAlt,
      booking_seen: FaHome,
      booking_responded: FaHome,
      booking_status_changed: FaHome,
      payment_paid: FaCreditCard,
      property_approved: FaHome,
      property_rejected: FaHome,
    };
    return icons[type] || FaInfoCircle;
  };

  const getNotificationColor = (type) => {
    const colors = {
      booking_created: "bg-blue-100 text-blue-600",
      booking_seen: "bg-purple-100 text-purple-600",
      booking_responded: "bg-green-100 text-green-600",
      booking_status_changed: "bg-amber-100 text-amber-600",
      payment_paid: "bg-emerald-100 text-emerald-600",
      property_approved: "bg-green-100 text-green-600",
      property_rejected: "bg-red-100 text-red-600",
    };
    return colors[type] || "bg-gray-100 text-gray-600";
  };

  const unreadCount = items.filter(n => !n.readAt).length;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center relative">
                <FaBell className="text-teal-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white 
                    text-xs rounded-full flex items-center justify-center font-bold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </span>
              Notifications
            </h1>
            <p className="text-gray-500 mt-2">Booking updates, approvals, and payment events.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={load}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 
                rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-300 
                transition-all duration-200 font-medium disabled:opacity-50"
            >
              <FaSync className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={onReadAll}
              disabled={loading || unreadCount === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 
                bg-gray-900 text-white rounded-xl font-medium
                hover:bg-gray-800 transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaCheckDouble />
              Mark All Read
            </button>
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

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg p-5 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && items.length === 0 && !error && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaInbox className="text-4xl text-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Notifications Yet</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              When you receive booking updates, payment confirmations, or other important 
              notifications, they'll appear here.
            </p>
          </div>
        )}

        {/* Notifications List */}
        {!loading && items.length > 0 && (
          <div className="space-y-3">
            {items.map((n) => {
              const IconComponent = getNotificationIcon(n.type);
              const iconColor = getNotificationColor(n.type);
              const isUnread = !n.readAt;

              return (
                <div
                  key={n._id}
                  className={`bg-white rounded-xl shadow-lg border overflow-hidden
                    transition-all duration-300 hover:shadow-xl
                    ${isUnread ? "border-teal-200 border-l-4 border-l-teal-500" : "border-gray-100"}`}
                >
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                        shrink-0 ${iconColor}`}>
                        <IconComponent />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className={`font-semibold ${isUnread ? "text-gray-900" : "text-gray-600"}`}>
                              {n.title}
                            </h3>
                            <p className={`text-sm mt-1 ${isUnread ? "text-gray-700" : "text-gray-500"}`}>
                              {n.message}
                            </p>
                            <div className="flex items-center gap-3 mt-3">
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <FaCalendarAlt className="text-xs" />
                                {n.createdAt ? new Date(n.createdAt).toLocaleString() : "—"}
                              </span>
                              {n.type && (
                                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                                  {n.type.replace(/_/g, " ")}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Mark Read Button */}
                          {isUnread && (
                            <button
                              onClick={() => onRead(n._id)}
                              className="shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium
                                bg-teal-50 text-teal-700 hover:bg-teal-100 
                                transition-all duration-200 flex items-center gap-1.5"
                            >
                              <FaCheck className="text-xs" />
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
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
