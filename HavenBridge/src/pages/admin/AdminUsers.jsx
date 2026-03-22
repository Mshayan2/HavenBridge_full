import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminGetUsers, adminUpdateUserRole } from "../../api/admin";
import { 
  FaUsers, FaSync, FaExclamationTriangle, FaUserShield, FaUser, FaUserTie,
  FaEnvelope, FaCalendarAlt, FaSearch, FaInbox
} from "react-icons/fa";

const ROLE_OPTIONS = ["customer", "staff", "admin"];

const getRoleConfig = (role) => {
  const configs = {
    admin: { icon: FaUserShield, bg: "bg-purple-100", text: "text-purple-700" },
    staff: { icon: FaUserTie, bg: "bg-blue-100", text: "text-blue-700" },
    customer: { icon: FaUser, bg: "bg-gray-100", text: "text-gray-700" },
  };
  return configs[role] || configs.customer;
};

export default function AdminUsers() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
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
      const res = await adminGetUsers();
      const list = Array.isArray(res?.data) ? res.data : (res?.data?.users || []);
      setUsers(Array.isArray(list) ? list : []);
    } catch (e) {
      const msg = e?.message || "Failed to load users.";
      setError(msg);
      if (String(msg).toLowerCase().includes("unauthorized") || String(msg).includes("401")) {
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

  async function onChangeRole(userId, newRole) {
    setError("");
    try {
      await adminUpdateUserRole(userId, newRole);
      await load();
    } catch (e) {
      setError(e?.message || "Failed to update user role.");
    }
  }

  const filteredUsers = users.filter(u => {
    const term = searchTerm.toLowerCase();
    return (u.name || "").toLowerCase().includes(term) || 
           (u.email || "").toLowerCase().includes(term);
  });

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <FaUsers className="text-purple-600" />
              </span>
              Admin — Users
            </h1>
            <p className="text-gray-500 mt-2">View users and manage their roles.</p>
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
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl
                focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500
                transition-all duration-200 outline-none"
            />
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaInbox className="text-4xl text-purple-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Users Found</h3>
            <p className="text-gray-500">
              {searchTerm ? "Try a different search term." : "No users registered yet."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((u) => {
                    const roleConfig = getRoleConfig(u.role);
                    const RoleIcon = roleConfig.icon;
                    return (
                      <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full ${roleConfig.bg} flex items-center justify-center`}>
                              <RoleIcon className={roleConfig.text} />
                            </div>
                            <span className="font-medium text-gray-900">{u.name || "—"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <FaEnvelope className="text-gray-400 text-sm" />
                            <span className="text-sm">{u.email || "—"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm
                              focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500
                              transition-all duration-200 outline-none cursor-pointer"
                            value={u.role || "customer"}
                            onChange={(e) => onChangeRole(u._id, e.target.value)}
                            disabled={!u?._id}
                          >
                            {ROLE_OPTIONS.map((r) => (
                              <option key={r} value={r}>
                                {r.charAt(0).toUpperCase() + r.slice(1)}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <FaCalendarAlt className="text-gray-400" />
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
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
          {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""} total
        </div>
      </div>
    </div>
  );
}
