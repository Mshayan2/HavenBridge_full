import apiClient from "./apiClient";

export const loginUser = async (data) => {
  const res = await apiClient.post("/auth/login", data);
  return res.data;
};

export const registerUser = async (data) => {
  const res = await apiClient.post("/auth/register", data);
  return res.data;
};

export const refreshAuth = async () => {
  const res = await apiClient.post("/auth/refresh");
  return res.data;
};

export const logoutUser = async () => {
  const res = await apiClient.post("/auth/logout");
  return res.data;
};

export const verifyEmail = async (params) => {
  const res = await apiClient.get(`/auth/verify-email`, { params });
  return res.data;
};

export const resendVerification = async (data) => {
  const res = await apiClient.post(`/auth/resend-verification`, data);
  return res.data;
};

export const forgotPassword = async (data) => {
  const res = await apiClient.post(`/auth/forgot-password`, data);
  return res.data;
};

export const resetPassword = async (data) => {
  const res = await apiClient.post(`/auth/reset-password`, data);
  return res.data;
};

export const startPhoneOtp = async (data) => {
  const res = await apiClient.post(`/auth/phone/start`, data);
  return res.data;
};

export const verifyPhoneOtp = async (data) => {
  const res = await apiClient.post(`/auth/phone/verify`, data);
  return res.data;
};

export const getProfile = async () => {
  const res = await apiClient.get("/auth/profile");
  return res.data;
};

export const updateProfile = async (data) => {
  const res = await apiClient.put('/auth/profile', data);
  return res.data;
};
