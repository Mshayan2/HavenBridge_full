import React from "react";
import {
  FaCheckCircle,
  FaListAlt,
  FaFileAlt,
  FaChartLine,
  FaEnvelope,
  FaPhone,
  FaHome,
  FaDownload,
} from "react-icons/fa";

const SuccessScreen = ({ onListAnother }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 text-center border border-teal-100">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <FaCheckCircle className="text-green-500 text-4xl" />
      </div>
      <h2 className="text-3xl font-bold text-teal-900 mb-4">Congratulations!</h2>
      <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
        Your property has been successfully submitted for review. Our team will contact you within 24 hours.
      </p>

      <div className="bg-teal-50 p-6 rounded-xl mb-8 border border-teal-200">
        <h3 className="text-xl font-bold text-teal-900 mb-4">What happens next?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-3">
              <FaFileAlt className="text-teal-600" />
            </div>
            <h4 className="font-semibold text-teal-900 mb-2">Document Verification</h4>
            <p className="text-gray-600 text-sm">
              Our team will verify all property documents within 24 hours
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-3">
              <FaChartLine className="text-teal-600" />
            </div>
            <h4 className="font-semibold text-teal-900 mb-2">Market Analysis</h4>
            <p className="text-gray-600 text-sm">
              We'll provide pricing recommendations based on market trends
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-3">
              <FaEnvelope className="text-teal-600" />
            </div>
            <h4 className="font-semibold text-teal-900 mb-2">Buyer Connections</h4>
            <p className="text-gray-600 text-sm">
              We'll connect you with verified buyers matching your criteria
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 max-w-md mx-auto">
        <button
          onClick={onListAnother}
          className="w-full px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <FaListAlt /> List Another Property
        </button>

        <div className="grid grid-cols-2 gap-4">
          <button className="px-6 py-3 border-2 border-teal-600 text-teal-600 font-semibold rounded-lg hover:bg-teal-50 transition-colors flex items-center justify-center gap-2">
            <FaHome /> Track Your Listing
          </button>
          <button className="px-6 py-3 border-2 border-orange-500 text-orange-500 font-semibold rounded-lg hover:bg-orange-50 transition-colors flex items-center justify-center gap-2">
            <FaDownload /> Download Documents
          </button>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-teal-200">
        <h4 className="font-semibold text-teal-900 mb-4">Need immediate assistance?</h4>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
            <FaPhone /> Call Support: (021) 111-111-111
          </button>
          <button className="px-6 py-3 border-2 border-teal-600 text-teal-600 font-semibold rounded-lg hover:bg-teal-50 transition-colors">
            Live Chat Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessScreen;
