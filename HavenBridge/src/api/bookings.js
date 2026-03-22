import apiClient from "./apiClient";

// Create booking (customer)
// Backend route: POST /api/bookings
export const createBooking = async (data) => {
  const res = await apiClient.post("/bookings", data);
  return res.data;
};

// Get bookings for logged-in customer
// Backend route: GET /api/bookings/my-bookings
export const getMyBookings = async () => {
  const res = await apiClient.get("/bookings/my-bookings");
  return res.data;
};

// Seller: get bookings for my listed properties
// Backend route: GET /api/bookings/my-properties
export const getBookingsForMyProperties = async () => {
  const res = await apiClient.get("/bookings/my-properties");
  return res.data;
};

// Cancel (delete) a booking owned by the logged-in customer
// Backend route: DELETE /api/bookings/my/:id
export const cancelMyBooking = async (id) => {
  const res = await apiClient.delete(`/bookings/my/${id}`);
  return res.data;
};
