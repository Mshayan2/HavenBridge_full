import apiClient from "./apiClient";

export async function listSavedSearches(config = {}) {
  const res = await apiClient.get(`/saved-searches`, config);
  return res.data;
}

export async function createSavedSearch(payload) {
  const res = await apiClient.post(`/saved-searches`, payload);
  return res.data;
}

export async function updateSavedSearch(id, payload) {
  const res = await apiClient.put(`/saved-searches/${id}`, payload);
  return res.data;
}

export async function deleteSavedSearch(id) {
  const res = await apiClient.delete(`/saved-searches/${id}`);
  return res.data;
}

export async function runSavedSearchNow(id) {
  const res = await apiClient.post(`/saved-searches/${id}/run`);
  return res.data;
}
