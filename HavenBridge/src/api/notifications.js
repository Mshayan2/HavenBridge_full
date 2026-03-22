import apiClient from "./apiClient";

export const getMyNotifications = async ({ includeRead = false, limit = 50 } = {}) => {
  const qs = new URLSearchParams();
  if (includeRead) qs.set("includeRead", "true");
  if (limit) qs.set("limit", String(limit));
  const res = await apiClient.get(`/notifications/my?${qs.toString()}`);
  return res.data;
};

export const markNotificationRead = async (id) => {
  const res = await apiClient.post(`/notifications/my/${id}/read`, {});
  return res.data;
};

export const markAllNotificationsRead = async () => {
  const res = await apiClient.post(`/notifications/my/read-all`, {});
  return res.data;
};
