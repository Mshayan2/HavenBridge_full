import apiClient from "./apiClient";

export const createBookingTokenCheckoutSession = async (bookingId) => {
  const res = await apiClient.post("/payments/booking-token/checkout-session", { bookingId });
  return res.data;
};

export const sellerConnectStatus = async () => {
  const res = await apiClient.get("/payments/seller/connect/status");
  return res.data;
};

export const sellerConnectOnboard = async () => {
  const res = await apiClient.post("/payments/seller/connect/onboard", {});
  return res.data;
};

export const adminListPayments = async () => {
  const res = await apiClient.get("/payments/admin");
  return res.data;
};

export const adminReleasePayment = async (paymentId) => {
  const res = await apiClient.post(`/payments/admin/release/${paymentId}`, {});
  return res.data;
};

export const adminListNonStripePayments = async () => {
  const res = await apiClient.get('/payments/admin/nonstripe');
  return res.data;
};

export const adminReleaseNonStripePayment = async (paymentId) => {
  const res = await apiClient.post(`/payments/admin/release-nonstripe/${paymentId}`, {});
  return res.data;
};

export const adminRecordManualIncoming = async (payload) => {
  const res = await apiClient.post("/payments/admin/manual", payload);
  return res.data;
};

export const getPaymentsStatus = async () => {
  const res = await apiClient.get("/payments/status");
  return res.data;
};
