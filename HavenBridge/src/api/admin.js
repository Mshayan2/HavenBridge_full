// HavenBridge/src/api/admin.js
// Admin API helpers used by the admin pages
import apiClient from "./apiClient";

export async function adminGetUsers() {
  // GET /api/users  (admin-only backend route)
  return apiClient.get("/users");
}

export async function adminUpdateUserRole(userId, role) {
  // PUT /api/users/:id/role  (admin-only)
  return apiClient.put(`/users/${userId}/role`, { role });
}

export async function adminGetProperties() {
  // GET /api/properties/admin  (admin-only, returns all properties including pending/rejected)
  return apiClient.get("/properties/admin");
}

export async function adminDeleteProperty(propertyId) {
  // DELETE /api/properties/:id (admin-only)
  return apiClient.delete(`/properties/${propertyId}`);
}

export async function adminApproveProperty(propertyId, reason) {
  return apiClient.put(`/properties/admin/${propertyId}/approve`, { reason });
}

export async function adminRejectProperty(propertyId, reason) {
  return apiClient.put(`/properties/admin/${propertyId}/reject`, { reason });
}

export async function adminUpdateReservationPolicy(propertyId, payload) {
  return apiClient.put(`/properties/admin/${propertyId}/reservation-policy`, payload);
}

export async function adminUpdateRentalPolicy(propertyId, payload) {
  return apiClient.put(`/properties/admin/${propertyId}/rental-policy`, payload);
}

export async function adminGetRentalPolicy(propertyId) {
  return apiClient.get(`/properties/admin/${propertyId}/rental-policy`);
}

export async function adminUpdatePropertyGeo(propertyId, payload) {
  // PUT /api/properties/admin/:id/geo  (admin/staff)
  // payload example: { lat: 31.5204, lng: 74.3587 }
  return apiClient.put(`/properties/admin/${propertyId}/geo`, payload);
}

export async function adminGetBookings() {
  // GET /api/bookings  (admin-only list)
  return apiClient.get("/bookings");
}

export async function adminUpdateBooking(bookingId, data) {
  // PUT /api/bookings/:id  (admin-only update)
  // data example: { status: 'confirmed' }
  return apiClient.put(`/bookings/${bookingId}`, data);
}