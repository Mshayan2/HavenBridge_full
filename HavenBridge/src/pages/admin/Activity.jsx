import React from 'react';
import { FaClipboardList, FaCheckCircle, FaHome, FaUser, FaClock } from 'react-icons/fa';

export default function AdminActivity() {
  // Placeholder activity data
  const activities = [
    {
      id: 1,
      action: "Property Approved",
      description: "Admin approved property #123",
      timestamp: "2025-12-24 10:12",
      icon: FaHome,
      color: "green"
    },
    {
      id: 2,
      action: "New Listing Created",
      description: "User john@example.com created a listing",
      timestamp: "2025-12-23 18:02",
      icon: FaUser,
      color: "blue"
    },
    {
      id: 3,
      action: "Booking Confirmed",
      description: "Admin confirmed booking for Modern Apartment",
      timestamp: "2025-12-23 14:30",
      icon: FaCheckCircle,
      color: "teal"
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      green: { bg: "bg-green-100", text: "text-green-600" },
      blue: { bg: "bg-blue-100", text: "text-blue-600" },
      teal: { bg: "bg-teal-100", text: "text-teal-600" },
      amber: { bg: "bg-amber-100", text: "text-amber-600" },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <FaClipboardList className="text-indigo-600" />
            </span>
            Activity Log
          </h1>
          <p className="text-gray-500 mt-2">Recent admin and user actions for audit purposes.</p>
        </div>

        {/* Activity Timeline */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="space-y-6">
            {activities.map((activity, index) => {
              const Icon = activity.icon;
              const colorClasses = getColorClasses(activity.color);
              return (
                <div key={activity.id} className="flex gap-4">
                  {/* Timeline Line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-xl ${colorClasses.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={colorClasses.text} />
                    </div>
                    {index < activities.length - 1 && (
                      <div className="w-0.5 flex-1 bg-gray-200 mt-2" />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 pb-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{activity.action}</h3>
                        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
                        <FaClock />
                        {activity.timestamp}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Placeholder Note */}
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-400">
              This is placeholder data. Activity logging will be populated from the backend audit API.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
