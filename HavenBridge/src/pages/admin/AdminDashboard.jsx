import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaHome, FaCalendarCheck, FaUsers, FaCreditCard, FaChartLine, FaCog,
  FaClipboardList, FaArrowRight, FaShieldAlt
} from 'react-icons/fa';

export default function AdminDashboard() {
  const cards = [
    {
      to: "/admin/properties",
      icon: FaHome,
      title: "Manage Properties",
      description: "Approve, edit, or remove listings",
      color: "teal",
      gradient: "from-teal-500 to-teal-600"
    },
    {
      to: "/admin/bookings",
      icon: FaCalendarCheck,
      title: "Manage Bookings",
      description: "View and update booking statuses",
      color: "blue",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      to: "/admin/users",
      icon: FaUsers,
      title: "Manage Users",
      description: "View users and manage roles",
      color: "purple",
      gradient: "from-purple-500 to-purple-600"
    },
    {
      to: "/admin/payments",
      icon: FaCreditCard,
      title: "Manage Payments",
      description: "Release payments and record manual transactions",
      color: "emerald",
      gradient: "from-emerald-500 to-emerald-600"
    },
    {
      to: "/admin/reports",
      icon: FaChartLine,
      title: "Reports & Analytics",
      description: "View charts and export data",
      color: "orange",
      gradient: "from-orange-500 to-orange-600"
    },
    {
      to: "/admin/activity",
      icon: FaClipboardList,
      title: "Activity Log",
      description: "Audit trail of admin actions",
      color: "indigo",
      gradient: "from-indigo-500 to-indigo-600"
    }
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-gray-800 to-gray-900 flex items-center justify-center shadow-lg">
              <FaShieldAlt className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-500">Overview and management tools for administrators</p>
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <Link 
              key={index}
              to={card.to} 
              className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden
                hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Card Header */}
              <div className={`bg-gradient-to-r ${card.gradient} p-5`}>
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <card.icon className="text-2xl text-white" />
                </div>
              </div>
              
              {/* Card Content */}
              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center justify-between">
                  {card.title}
                  <FaArrowRight className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all" />
                </h3>
                <p className="text-sm text-gray-500">{card.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Stats Placeholder */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <FaChartLine className="text-gray-400" />
            Quick Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-3xl font-bold text-teal-600 mb-1">—</div>
              <div className="text-sm text-gray-500">Properties</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-3xl font-bold text-blue-600 mb-1">—</div>
              <div className="text-sm text-gray-500">Bookings</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-3xl font-bold text-purple-600 mb-1">—</div>
              <div className="text-sm text-gray-500">Users</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-3xl font-bold text-emerald-600 mb-1">—</div>
              <div className="text-sm text-gray-500">Revenue</div>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-6">
            Stats will be populated from the backend analytics API
          </p>
        </div>

        {/* Settings Link */}
        <div className="mt-6 text-center">
          <Link 
            to="/admin/settings" 
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FaCog />
            Admin Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
