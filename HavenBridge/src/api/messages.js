import apiClient from "./apiClient";

export async function listConversations(config = {}) {
  const res = await apiClient.get(`/messages/conversations`, config);
  return res.data;
}

export async function createOrGetConversation(propertyId) {
  const res = await apiClient.post(`/messages/conversations`, { propertyId });
  return res.data;
}

export async function listMessages(conversationId, params = {}, config = {}) {
  const qs = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    qs.set(k, String(v));
  });
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  const res = await apiClient.get(`/messages/conversations/${conversationId}/messages${suffix}`, config);
  return res.data;
}

export async function sendMessage(conversationId, body) {
  const res = await apiClient.post(`/messages/conversations/${conversationId}/messages`, { body });
  return res.data;
}

export async function markConversationRead(conversationId) {
  const res = await apiClient.post(`/messages/conversations/${conversationId}/read`);
  return res.data;
}
