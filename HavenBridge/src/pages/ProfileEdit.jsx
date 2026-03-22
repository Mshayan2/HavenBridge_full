import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../api/auth';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FaUser, FaEnvelope, FaLock, FaArrowLeft, FaSave, FaSpinner, 
  FaCheckCircle, FaExclamationTriangle, FaEye, FaEyeSlash, FaUserEdit
} from 'react-icons/fa';

export default function ProfileEdit() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await getProfile();
        setForm({ name: data.name || '', email: data.email || '', password: '' });
      } catch (e) {
        console.error(e);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);

    try {
      const updated = await updateProfile({
        name: form.name,
        email: form.email,
        password: form.password || undefined
      });

      // Update localStorage
      const storedRaw = localStorage.getItem('user');
      let stored = storedRaw ? JSON.parse(storedRaw) : {};
      stored = { ...stored, name: updated.name, email: updated.email };
      localStorage.setItem('user', JSON.stringify(stored));

      setSuccess(true);
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err?.data?.message || err?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-gray-50 to-white 
        flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <FaSpinner className="animate-spin text-2xl" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Back Link */}
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-teal-600 
            transition-colors mb-6 group"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          Back to Profile
        </Link>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full 
              bg-white/20 backdrop-blur-sm mb-3">
              <FaUserEdit className="text-3xl text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
            <p className="text-teal-100 mt-1 text-sm">Update your account information</p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="p-8 space-y-5">
            {/* Success Message */}
            {success && (
              <div className="rounded-xl bg-green-50 border border-green-200 p-4 
                flex items-center gap-3 animate-fade-in">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <FaCheckCircle className="text-green-500" />
                </div>
                <div>
                  <p className="text-green-800 font-medium">Profile updated successfully!</p>
                  <p className="text-green-600 text-sm">Redirecting to profile...</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4 
                flex items-start gap-3 animate-fade-in">
                <FaExclamationTriangle className="text-red-500 shrink-0 mt-0.5" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            {/* Name Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <FaUser />
                </div>
                <input
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl 
                    focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                    transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="Your full name"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <FaEnvelope />
                </div>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl 
                    focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                    transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                New Password
                <span className="font-normal text-gray-500 ml-1">(optional)</span>
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <FaLock />
                </div>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={onChange}
                  className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl 
                    focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                    transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="Leave blank to keep current password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 
                    hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1.5">
                Use at least 12 characters if changing password
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3.5 rounded-xl font-semibold text-white
                  bg-gradient-to-r from-teal-600 to-teal-700
                  hover:from-teal-700 hover:to-teal-800
                  disabled:opacity-60 disabled:cursor-not-allowed
                  transition-all duration-300 shadow-lg shadow-teal-500/25
                  flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FaSave />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/profile')}
                disabled={saving}
                className="px-6 py-3.5 rounded-xl font-medium text-gray-700
                  border border-gray-200 hover:bg-gray-50 hover:border-gray-300
                  transition-all duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Security Note */}
        <div className="mt-6 bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            🔒 Your information is encrypted and secure. We never share your data with third parties.
          </p>
        </div>
      </div>
    </div>
  );
}
