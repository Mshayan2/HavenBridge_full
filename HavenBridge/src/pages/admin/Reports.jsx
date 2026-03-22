import React from 'react';
import { FaChartLine, FaChartBar, FaChartPie, FaDownload, FaCalendarAlt } from 'react-icons/fa';

export default function AdminReports() {
  const reportCards = [
    {
      title: "Listings by Month",
      description: "Track property listings over time",
      icon: FaChartBar,
      color: "teal"
    },
    {
      title: "Bookings & Conversions",
      description: "Analyze booking success rates",
      icon: FaChartLine,
      color: "blue"
    },
    {
      title: "Revenue Overview",
      description: "Monthly and quarterly revenue trends",
      icon: FaChartPie,
      color: "emerald"
    },
    {
      title: "User Growth",
      description: "New user registrations over time",
      icon: FaChartLine,
      color: "purple"
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      teal: { bg: "bg-teal-100", text: "text-teal-600", gradient: "from-teal-500 to-teal-600" },
      blue: { bg: "bg-blue-100", text: "text-blue-600", gradient: "from-blue-500 to-blue-600" },
      emerald: { bg: "bg-emerald-100", text: "text-emerald-600", gradient: "from-emerald-500 to-emerald-600" },
      purple: { bg: "bg-purple-100", text: "text-purple-600", gradient: "from-purple-500 to-purple-600" },
    };
    return colors[color] || colors.teal;
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <FaChartLine className="text-orange-600" />
              </span>
              Reports & Analytics
            </h1>
            <p className="text-gray-500 mt-2">Overview charts and exportable reports.</p>
          </div>
          <div className="flex gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2.5 
              border border-gray-200 rounded-xl text-gray-700 font-medium
              hover:bg-gray-50 transition-colors">
              <FaCalendarAlt />
              Last 30 Days
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2.5 
              bg-gray-900 text-white rounded-xl font-medium
              hover:bg-gray-800 transition-colors">
              <FaDownload />
              Export
            </button>
          </div>
        </div>

        {/* Report Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {reportCards.map((card, index) => {
            const Icon = card.icon;
            const colorClasses = getColorClasses(card.color);
            return (
              <div 
                key={index}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
              >
                <div className={`bg-gradient-to-r ${colorClasses.gradient} px-6 py-4`}>
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <Icon />
                    {card.title}
                  </h3>
                  <p className="text-white/70 text-sm mt-1">{card.description}</p>
                </div>
                <div className="p-6 h-48 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <div className={`w-16 h-16 rounded-2xl ${colorClasses.bg} flex items-center justify-center mx-auto mb-4`}>
                      <Icon className={`text-2xl ${colorClasses.text}`} />
                    </div>
                    <p className="text-sm text-gray-400">Chart placeholder</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Quick Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-3xl font-bold text-teal-600 mb-1">—</div>
              <div className="text-sm text-gray-500">Total Listings</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-3xl font-bold text-blue-600 mb-1">—</div>
              <div className="text-sm text-gray-500">Active Bookings</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-3xl font-bold text-purple-600 mb-1">—</div>
              <div className="text-sm text-gray-500">Registered Users</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-3xl font-bold text-emerald-600 mb-1">—</div>
              <div className="text-sm text-gray-500">This Month Revenue</div>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-6">
            Stats will be populated from the backend analytics API
          </p>
        </div>
      </div>
    </div>
  );
}
