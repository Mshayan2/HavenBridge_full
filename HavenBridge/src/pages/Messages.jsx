import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  createOrGetConversation,
  listConversations,
  listMessages,
  markConversationRead,
  sendMessage,
} from "../api/messages";
import { toAssetUrl } from "../utils/url";
import { 
  FaComments, FaHome, FaPaperPlane, FaInbox, FaExclamationTriangle,
  FaMapMarkerAlt, FaExternalLinkAlt
} from "react-icons/fa";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function Messages() {
  const navigate = useNavigate();
  const query = useQuery();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(() => query.get("c") || null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin", { state: { redirectTo: "/messages" } });
    }
  }, [navigate]);

  // Start conversation from property (propertyId in query)
  useEffect(() => {
    const propertyId = query.get("propertyId");
    if (!propertyId) return;

    (async () => {
      try {
        const convo = await createOrGetConversation(propertyId);
        if (convo?._id) {
          navigate(`/messages?c=${convo._id}`, { replace: true });
          setActiveId(convo._id);
        }
      } catch (e) {
        alert(e?.data?.message || e?.message || "Failed to start conversation");
      }
    })();
  }, []);

  // Poll conversations list
  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;

    async function load() {
      try {
        setError("");
        const list = await listConversations({ signal: controller.signal });
        if (!mounted) return;
        setConversations(Array.isArray(list) ? list : []);
      } catch (e) {
        if (e?.aborted || e?.name === "AbortError") return;
        if (!mounted) return;
        setError(e?.data?.message || e?.message || "Failed to load conversations");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    const t = setInterval(load, 5000);

    return () => {
      mounted = false;
      controller.abort();
      clearInterval(t);
    };
  }, []);

  // Load messages for active conversation
  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }

    const controller = new AbortController();
    let mounted = true;

    (async () => {
      try {
        const out = await listMessages(activeId, { limit: 80 }, { signal: controller.signal });
        if (!mounted) return;
        setMessages(out?.items || []);
        await markConversationRead(activeId);
        setConversations((prev) => prev.map((c) => (c._id === activeId ? { ...c, unreadCount: 0 } : c)));
      } catch (e) {
        if (e?.aborted || e?.name === "AbortError") return;
        if (!mounted) return;
        setError(e?.data?.message || e?.message || "Failed to load messages");
      }
    })();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [activeId]);

  const activeConvo = conversations.find((c) => c._id === activeId) || null;

  async function onSend() {
    const text = draft.trim();
    if (!text || !activeId) return;

    setSending(true);
    setDraft("");
    try {
      const msg = await sendMessage(activeId, text);
      setMessages((prev) => [...prev, msg]);
    } catch (e) {
      alert(e?.data?.message || e?.message || "Failed to send");
      setDraft(text);
    } finally {
      setSending(false);
    }
  }

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}")

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <FaComments className="text-purple-600" />
              </span>
              Messages
            </h1>
            <p className="text-gray-500 mt-1">Chat with sellers and buyers directly.</p>
          </div>
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 
              rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-300 
              transition-all duration-200 font-medium"
          >
            <FaHome className="text-teal-600" />
            Browse Properties
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 rounded-xl border border-red-200 bg-red-50 
            flex items-start gap-3 animate-fade-in">
            <FaExclamationTriangle className="text-red-500 shrink-0 mt-0.5" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                  <FaInbox className="text-gray-400" />
                  Inbox
                  {conversations.filter(c => c.unreadCount > 0).length > 0 && (
                    <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                      {conversations.filter(c => c.unreadCount > 0).length}
                    </span>
                  )}
                </h2>
              </div>

              {loading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FaInbox className="text-2xl text-gray-300" />
                  </div>
                  <p className="text-gray-500 text-sm">No conversations yet</p>
                  <p className="text-gray-400 text-xs mt-1">Start by messaging a property seller</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 max-h-[60vh] overflow-auto">
                  {conversations.map((c) => (
                    <button
                      key={c._id}
                      onClick={() => {
                        setActiveId(c._id);
                        navigate(`/messages?c=${c._id}`, { replace: true });
                      }}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition-colors
                        ${activeId === c._id ? "bg-teal-50 border-l-4 border-l-teal-500" : "bg-white"}`}
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={toAssetUrl(c.property?.images?.[0])}
                          alt={c.property?.title || "Property"}
                          className="w-12 h-12 rounded-xl object-cover bg-gray-100"
                          onError={(e) => {
                            const img = e.currentTarget;
                            if (img.dataset._hadError) return;
                            img.dataset._hadError = "1";
                            img.onerror = null;
                            img.src = "/vite.svg";
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-gray-900 truncate text-sm">
                            {c.property?.title || "Conversation"}
                          </div>
                          <div className="text-xs text-gray-500 truncate mt-0.5">
                            {c.lastMessageText || "Start chatting..."}
                          </div>
                        </div>
                        {Number(c.unreadCount || 0) > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-semibold">
                            {c.unreadCount}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </aside>

          {/* Chat Area */}
          <section className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 
              overflow-hidden flex flex-col h-[70vh]">
              {/* Chat Header */}
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                {activeConvo ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={toAssetUrl(activeConvo.property?.images?.[0])}
                        alt=""
                        className="w-10 h-10 rounded-xl object-cover bg-gray-100"
                        onError={(e) => {
                          e.currentTarget.src = "/vite.svg";
                        }}
                      />
                      <div>
                        <div className="font-semibold text-gray-900">
                          {activeConvo.property?.title || "Chat"}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <FaMapMarkerAlt className="text-xs" />
                          {activeConvo.property?.location || "Location not set"}
                        </div>
                      </div>
                    </div>
                    {activeConvo.property?._id && (
                      <Link
                        to={`/properties/${activeConvo.property._id}`}
                        className="text-sm text-teal-600 hover:text-teal-700 font-medium
                          flex items-center gap-1 transition-colors"
                      >
                        View <FaExternalLinkAlt className="text-xs" />
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500">Select a conversation to start chatting</div>
                )}
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-auto p-5 space-y-4 bg-gray-50">
                {activeConvo ? (
                  messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                          <FaComments className="text-2xl text-gray-400" />
                        </div>
                        <p className="text-gray-500">No messages yet</p>
                        <p className="text-gray-400 text-sm">Say hi to start the conversation!</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((m) => {
                      const me = String(m.sender?._id || m.sender) === String(currentUser?._id);
                      return (
                        <div key={m._id} className={`flex ${me ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm
                              ${me 
                                ? "bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-br-md" 
                                : "bg-white text-gray-900 rounded-bl-md border border-gray-100"
                              }`}
                          >
                            <div className="text-sm whitespace-pre-wrap break-words">{m.body}</div>
                            <div className={`text-[11px] mt-1.5 ${me ? "text-teal-100" : "text-gray-400"}`}>
                              {m.createdAt ? new Date(m.createdAt).toLocaleString() : ""}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <FaComments className="text-5xl mb-3 mx-auto opacity-30" />
                      <p>Select a conversation from the sidebar</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-100 bg-white">
                <div className="flex gap-3">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={activeConvo ? "Type your message..." : "Select a conversation first"}
                    disabled={!activeConvo || sending}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl
                      focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                      transition-all duration-200 bg-gray-50 focus:bg-white
                      disabled:bg-gray-100 disabled:cursor-not-allowed"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        onSend();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={onSend}
                    disabled={!activeConvo || !draft.trim() || sending}
                    className="px-5 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white 
                      rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed
                      hover:from-teal-700 hover:to-teal-800 transition-all duration-300
                      flex items-center gap-2"
                  >
                    <FaPaperPlane className={sending ? "animate-pulse" : ""} />
                    {sending ? "..." : "Send"}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Press Enter to send • Shift+Enter for new line
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
