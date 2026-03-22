import apiClient from "./apiClient";

export async function listMyFavorites(params = {}, config = {}) {
  const qs = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    qs.set(k, String(v));
  });
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  const res = await apiClient.get(`/favorites${suffix}`, config);
  return res.data;
}

export async function listMyFavoriteIds(config = {}) {
  const res = await apiClient.get(`/favorites/ids`, config);
  return res.data;
}

export async function addFavorite(propertyId) {
  const res = await apiClient.post(`/favorites`, { propertyId });
  return res.data;
}

export async function removeFavoriteByProperty(propertyId) {
  const res = await apiClient.delete(`/favorites/property/${propertyId}`);
  return res.data;
}
