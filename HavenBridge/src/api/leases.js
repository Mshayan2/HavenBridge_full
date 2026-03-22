import apiClient from "./apiClient";

export async function requestLease(payload) {
  const res = await apiClient.post("/leases", payload);
  return res.data;
}

export async function getMyLeases() {
  const res = await apiClient.get("/leases/my");
  return res.data;
}

export async function getLandlordLeases() {
  const res = await apiClient.get("/leases/landlord");
  return res.data;
}

export async function approveLease(leaseId, payload = {}) {
  const res = await apiClient.put(`/leases/${leaseId}/approve`, payload);
  return res.data;
}

export async function rejectLease(leaseId, reason) {
  const res = await apiClient.put(`/leases/${leaseId}/reject`, { reason });
  return res.data;
}

export async function createLeaseCheckoutSession(leaseId, installmentId) {
  const res = await apiClient.post(`/leases/${leaseId}/checkout-session`, { installmentId });
  return res.data;
}
