import apiClient from "./apiClient";

// Backend: GET /api/reservations/quote/:propertyId
export async function getReservationQuote(propertyId, opts = {}) {
  const res = await apiClient.get(`/reservations/quote/${propertyId}`, opts);
  return res.data;
}

// Backend: GET /api/reservations/property/:propertyId/mine
export async function getMyReservationForProperty(propertyId, opts = {}) {
  const res = await apiClient.get(`/reservations/property/${propertyId}/mine`, opts);
  return res.data;
}

// Backend: GET /api/reservations/my
export async function listMyReservations(opts = {}) {
  const res = await apiClient.get("/reservations/my", opts);
  return res.data;
}

// Backend: POST /api/reservations/:propertyId/start
export async function startReservation(propertyId) {
  const res = await apiClient.post(`/reservations/${propertyId}/start`, {});
  return res.data;
}

// Backend: POST /api/reservations/:reservationId/fee/checkout-session
export async function resumeReservationFeePayment(reservationId) {
  const res = await apiClient.post(`/reservations/${reservationId}/fee/checkout-session`, {});
  return res.data;
}

// Backend: POST /api/reservations/:reservationId/pay-remaining
export async function payRemainingBalance(reservationId) {
  const res = await apiClient.post(`/reservations/${reservationId}/pay-remaining`, {});
  return res.data;
}
