import React, { useEffect, useState } from "react";
import { getProfile } from "../api/auth";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaEnvelope, FaUserTag, FaCalendar, FaSignOutAlt, FaEdit, FaHome, FaList, FaCreditCard, FaHeart, FaBell, FaBookmark, FaCalendarCheck, FaKey, FaChevronRight } from "react-icons/fa";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let didCancel = false;
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        if (!didCancel && data) setUser(data);
      } catch (err) {
        console.error("Failed to load profile:", err);
        if (!didCancel) setError(err?.data?.message || err.message || "Failed to load profile");
      } finally {
        if (!didCancel) setLoading(false);
      }
    };

    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (_e) {}
    }

    fetchProfile();

    return () => {
      didCancel = true;
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const initials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gray-200" />
              <div className="space-y-3">
                <div className="h-6 w-48 bg-gray-200 rounded" />
                <div className="h-4 w-32 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
            <FaUser className="text-red-500 text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Profile</h2>
          <p className="text-gray-600 mb-6">{error || "Please sign in to view your profile."}</p>
          <Link 
            to="/signin" 
            className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-xl
              font-semibold hover:bg-teal-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const quickLinks = [
    { icon: FaHome, label: "List a Property", to: "/sell", primary: true },
    { icon: FaList, label: "My Listings", to: "/my-listings" },
    { icon: FaCalendarCheck, label: "My Bookings", to: "/my-bookings" },
    { icon: FaHeart, label: "Favorites", to: "/favorites" },
    { icon: FaBookmark, label: "Saved Searches", to: "/saved-searches" },
    { icon: FaBell, label: "Notifications", to: "/notifications" },
    { icon: FaCreditCard, label: "Setup Payouts", to: "/seller/stripe" },
  ];

  const profileFields = [
    { icon: FaUser, label: "Full Name", value: user.name || user.fullName || user.username || "—" },
    { icon: FaEnvelope, label: "Email", value: user.email || "—" },
    { icon: FaUserTag, label: "Role", value: (user.role || "customer").charAt(0).toUpperCase() + (user.role || "customer").slice(1) },
    { icon: FaCalendar, label: "Member Since", value: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "—" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 h-40 relative">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')`,
            backgroundRepeat: 'repeat'
          }}
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-20 pb-12">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-8">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-8">
              {/* Avatar */}
              <div className="relative">
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 
                  flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-teal-500/30">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="User avatar" className="w-full h-full rounded-2xl object-cover" />
                  ) : (
                    initials(user.name || user.fullName || user.username)
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-green-500 border-4 border-white
                  flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              </div>

              {/* Name & Email */}
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.name || user.fullName || user.username}
                </h1>
                <p className="text-gray-500">{user.email}</p>
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-sm font-medium">
                  <FaUserTag className="text-xs" />
                  {(user.role || "customer").charAt(0).toUpperCase() + (user.role || "customer").slice(1)}
                </div>
              </div>

              {/* Edit Button */}
              <button 
                onClick={() => navigate("/profile/edit")}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl
                  font-medium hover:bg-gray-200 transition-colors"
              >
                <FaEdit className="text-sm" /> Edit Profile
              </button>
            </div>

            {/* Profile Details Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {profileFields.map((field, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                      <field.icon className="text-teal-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">{field.label}</div>
                      <div className="font-medium text-gray-900 truncate max-w-[150px]">{field.value}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Links */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {quickLinks.map((link, index) => (
                  <Link
                    key={index}
                    to={link.to}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all duration-200
                      ${link.primary 
                        ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-md hover:shadow-lg hover:shadow-teal-500/25' 
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-teal-500 hover:shadow-md'}`}
                  >
                    <div className="flex items-center gap-3">
                      <link.icon className={link.primary ? 'text-teal-200' : 'text-teal-600'} />
                      <span className="font-medium">{link.label}</span>
                    </div>
                    <FaChevronRight className={`text-xs ${link.primary ? 'text-teal-200' : 'text-gray-400'}`} />
                  </Link>
                ))}
              </div>
            </div>

            {/* Security Section */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Security</h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/forgot-password"
                  className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-200
                    hover:border-teal-500 transition-colors"
                >
                  <FaKey className="text-gray-600" />
                  <span className="text-gray-700 font-medium">Change Password</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 bg-red-50 rounded-xl border border-red-100
                    text-red-600 hover:bg-red-100 transition-colors"
                >
                  <FaSignOutAlt />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
              <div className="bg-gray-50 rounded-xl p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <FaCalendar className="text-gray-400 text-xl" />
                </div>
                <p className="text-gray-600">No recent activity to show.</p>
                <p className="text-sm text-gray-500 mt-1">Your account actions will appear here.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
