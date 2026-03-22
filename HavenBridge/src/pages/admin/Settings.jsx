import React, { useState } from 'react';
import { FaCog, FaBuilding, FaEnvelope, FaSave, FaBell, FaShieldAlt } from 'react-icons/fa';

export default function AdminSettings() {
  const [companyInfo, setCompanyInfo] = useState({
    name: 'HavenBridge',
    email: 'info@havenbridge.com',
    phone: '+92 300 1234567',
    address: 'Lahore, Pakistan'
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpHost: '',
    smtpPort: '',
    smtpUser: '',
    smtpPass: ''
  });

  const handleCompanyChange = (e) => {
    setCompanyInfo({ ...companyInfo, [e.target.name]: e.target.value });
  };

  const handleEmailChange = (e) => {
    setEmailSettings({ ...emailSettings, [e.target.name]: e.target.value });
  };

  const handleSave = (section) => {
    alert(`${section} settings saved (placeholder)`);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
              <FaCog className="text-teal-600" />
            </span>
            Settings
          </h1>
          <p className="text-gray-500 mt-2">Configure application settings and preferences.</p>
        </div>

        {/* Company Info Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <FaBuilding />
              Company Information
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={companyInfo.name}
                  onChange={handleCompanyChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 
                    focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={companyInfo.email}
                  onChange={handleCompanyChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 
                    focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  value={companyInfo.phone}
                  onChange={handleCompanyChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 
                    focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={companyInfo.address}
                  onChange={handleCompanyChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 
                    focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                />
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <button 
                onClick={() => handleSave('Company')}
                className="inline-flex items-center gap-2 px-6 py-2.5 
                  bg-teal-600 text-white rounded-xl font-medium
                  hover:bg-teal-700 transition-colors"
              >
                <FaSave />
                Save Company Info
              </button>
            </div>
          </div>
        </div>

        {/* Email Settings Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <FaEnvelope />
              Email Settings (SMTP)
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Host
                </label>
                <input
                  type="text"
                  name="smtpHost"
                  value={emailSettings.smtpHost}
                  onChange={handleEmailChange}
                  placeholder="smtp.example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Port
                </label>
                <input
                  type="text"
                  name="smtpPort"
                  value={emailSettings.smtpPort}
                  onChange={handleEmailChange}
                  placeholder="587"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP User
                </label>
                <input
                  type="text"
                  name="smtpUser"
                  value={emailSettings.smtpUser}
                  onChange={handleEmailChange}
                  placeholder="user@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Password
                </label>
                <input
                  type="password"
                  name="smtpPass"
                  value={emailSettings.smtpPass}
                  onChange={handleEmailChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <button 
                onClick={() => handleSave('Email')}
                className="inline-flex items-center gap-2 px-6 py-2.5 
                  bg-blue-600 text-white rounded-xl font-medium
                  hover:bg-blue-700 transition-colors"
              >
                <FaSave />
                Save Email Settings
              </button>
            </div>
          </div>
        </div>

        {/* Additional Settings Placeholders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <FaBell className="text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Notifications</h3>
                <p className="text-sm text-gray-500">Configure notification preferences</p>
              </div>
            </div>
            <div className="h-20 bg-gray-50 rounded-xl flex items-center justify-center">
              <span className="text-sm text-gray-400">Coming soon</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <FaShieldAlt className="text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Security</h3>
                <p className="text-sm text-gray-500">Authentication & access control</p>
              </div>
            </div>
            <div className="h-20 bg-gray-50 rounded-xl flex items-center justify-center">
              <span className="text-sm text-gray-400">Coming soon</span>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          Settings are currently in placeholder mode and not persisted to the backend.
        </p>
      </div>
    </div>
  );
}
