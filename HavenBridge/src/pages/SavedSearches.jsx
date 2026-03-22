import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  deleteSavedSearch,
  listSavedSearches,
  runSavedSearchNow,
  updateSavedSearch,
} from "../api/savedSearches";
import { 
  FaSearch, FaHome, FaPlay, FaTrash, FaPause, FaBell, 
  FaExternalLinkAlt, FaExclamationTriangle, FaInbox, FaCog
} from "react-icons/fa";

export default function SavedSearches() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin", { state: { redirectTo: "/saved-searches" } });
      return;
    }

    const controller = new AbortController();
    let mounted = true;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const list = await listSavedSearches({ signal: controller.signal });
        if (!mounted) return;
        setItems(Array.isArray(list) ? list : []);
      } catch (e) {
        if (e?.aborted || e?.name === "AbortError") return;
        if (!mounted) return;
        setError(e?.data?.message || e?.message || "Failed to load saved searches");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [navigate]);

  async function toggleActive(s) {
    const next = !s.active;
    setItems((prev) => prev.map((x) => (x._id === s._id ? { ...x, active: next } : x)));
    try {
      await updateSavedSearch(s._id, { active: next });
    } catch (e) {
      setItems((prev) => prev.map((x) => (x._id === s._id ? s : x)));
      alert(e?.data?.message || e?.message || "Failed to update");
    }
  }

  async function changeFrequency(s, frequency) {
    const prev = s.frequency;
    setItems((p) => p.map((x) => (x._id === s._id ? { ...x, frequency } : x)));
    try {
      await updateSavedSearch(s._id, { frequency });
    } catch (e) {
      setItems((p) => p.map((x) => (x._id === s._id ? { ...x, frequency: prev } : x)));
      alert(e?.data?.message || e?.message || "Failed to update");
    }
  }

  async function runNow(s) {
    try {
      const out = await runSavedSearchNow(s._id);
      alert(`Run complete: ${out?.newMatches || 0} new matches.`);
    } catch (e) {
      alert(e?.data?.message || e?.message || "Failed to run");
    }
  }

  async function remove(s) {
    if (!confirm(`Delete saved search "${s.name}"?`)) return;
    setItems((prev) => prev.filter((x) => x._id !== s._id));
    try {
      await deleteSavedSearch(s._id);
    } catch (e) {
      alert(e?.data?.message || e?.message || "Failed to delete");
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <FaSearch className="text-blue-600" />
              </span>
              Saved Searches
            </h1>
            <p className="text-gray-500 mt-2">Get notified when new listings match your criteria.</p>
          </div>
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-200 
              rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-300 
              transition-all duration-200 font-medium"
          >
            <FaHome className="text-teal-600" />
            Browse Properties
          </Link>
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
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                  <div className="flex-1 space-y-3">
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
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaInbox className="text-4xl text-blue-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Saved Searches</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Search for properties and save your search to get notified when new listings match your criteria.
            </p>
            <Link
              to="/properties"
              className="inline-flex items-center gap-2 px-6 py-3 
                bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl 
                font-semibold hover:from-teal-700 hover:to-teal-800
                transition-all duration-300 shadow-lg shadow-teal-500/25"
            >
              <FaSearch />
              Browse & Save a Search
            </Link>
          </div>
        )}

        {/* Saved Searches List */}
        {!loading && items.length > 0 && (
          <div className="space-y-4">
            {items.map((s) => (
              <div
                key={s._id}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden
                  hover:shadow-xl transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    {/* Left: Info */}
                    <div className="flex gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0
                        ${s.active ? "bg-teal-100 text-teal-600" : "bg-gray-100 text-gray-400"}`}>
                        <FaBell className="text-xl" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{s.name}</h3>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold
                            ${s.active 
                              ? "bg-green-100 text-green-800" 
                              : "bg-gray-100 text-gray-600"
                            }`}>
                            {s.active ? "Active" : "Paused"}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-medium 
                            bg-blue-50 text-blue-700 border border-blue-100">
                            {s.frequency === "instant" ? "⚡ Instant" : 
                             s.frequency === "daily" ? "📅 Daily" : "📆 Weekly"}
                          </span>
                        </div>
                        <div className="mt-3 text-xs text-gray-500 bg-gray-50 rounded-lg p-3 
                          font-mono max-w-lg overflow-x-auto">
                          {JSON.stringify(s.query || {}, null, 2)}
                        </div>
                      </div>
                    </div>

                    {/* Right: Controls */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {/* Frequency Selector */}
                      <div className="relative">
                        <FaCog className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                        <select
                          value={s.frequency}
                          onChange={(e) => changeFrequency(s, e.target.value)}
                          className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm 
                            bg-white appearance-none cursor-pointer
                            focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          aria-label="Frequency"
                        >
                          <option value="instant">Instant</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                        </select>
                      </div>

                      {/* Toggle Active */}
                      <button
                        type="button"
                        onClick={() => toggleActive(s)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                          flex items-center gap-2 ${
                            s.active 
                              ? "bg-teal-600 text-white hover:bg-teal-700" 
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                      >
                        {s.active ? <FaBell /> : <FaPause />}
                        {s.active ? "Active" : "Paused"}
                      </button>

                      {/* Run Now */}
                      <button
                        type="button"
                        onClick={() => runNow(s)}
                        className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium
                          text-gray-700 hover:bg-gray-50 hover:border-gray-300 
                          transition-all duration-200 flex items-center gap-2"
                      >
                        <FaPlay className="text-xs" />
                        Run Now
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => remove(s)}
                        className="px-4 py-2 border border-red-200 rounded-xl text-sm font-medium
                          text-red-600 hover:bg-red-50 hover:border-red-300 
                          transition-all duration-200 flex items-center gap-2"
                      >
                        <FaTrash className="text-xs" />
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* View Results Link */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <Link
                      to={`/properties?${new URLSearchParams(s.query || {}).toString()}`}
                      className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 
                        font-medium text-sm transition-colors"
                    >
                      <FaExternalLinkAlt className="text-xs" />
                      View matching properties
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
