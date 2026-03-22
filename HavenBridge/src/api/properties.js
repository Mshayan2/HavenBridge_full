import apiClient from "./apiClient";

function toQuery(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters || {}).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    // allow arrays (e.g. features=pool&features=garden)
    if (Array.isArray(v)) {
      v.forEach((item) => {
        if (item !== undefined && item !== null && item !== "") params.append(k, String(item));
      });
      return;
    }
    params.set(k, String(v));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/**
 * Create / Submit a new property
 * Backend route: POST /api/properties
 */
export const submitProperty = async (data) => {
  const formData = new FormData();

  Object.keys(data).forEach((key) => {
    if (Array.isArray(data[key])) {
      data[key].forEach((item) => formData.append(key, item));
    } else if (data[key] !== undefined && data[key] !== null) {
      formData.append(key, data[key]);
    }
  });

  const res = await apiClient.post("/properties/submit", formData);
  return res.data;
};

/**
 * Get properties (supports filters, sorting, pagination)
 * Backend route: GET /api/properties
 */
export const getProperties = async (filters = {}, config = {}) => {
  const res = await apiClient.get(`/properties${toQuery(filters)}`, config);
  // API may return either an array (legacy) or a paginated object
  const data = res.data;
  return data;
};

/**
 * Get property facets (counts + min/max) for the current filter set
 * Backend route: GET /api/properties/facets
 */
export const getPropertyFacets = async (filters = {}, config = {}) => {
  const res = await apiClient.get(`/properties/facets${toQuery(filters)}`, config);
  return res.data;
};

// Backwards compatible alias
export const getAllProperties = async () => {
  const data = await getProperties({});
  // If server returns paginated object, return items
  return Array.isArray(data) ? data : (data?.items || []);
};

// (getProperties is the primary export now)

/**
 * Get single property
 * Backend route: GET /api/properties/:id
 */
export const getPropertyById = async (id, config = {}) => {
  const res = await apiClient.get(`/properties/${id}`, config);
  return res.data;
};

/**
 * Get effective reservation/payment policy for a property
 * Backend route: GET /api/properties/:id/reservation-policy
 */
export const getReservationPolicy = async (id, config = {}) => {
  const res = await apiClient.get(`/properties/${id}/reservation-policy`, config);
  return res.data;
};

/**
 * Delete property
 * Backend route: DELETE /api/properties/:id
 */
export const deleteProperty = async (id) => {
  const res = await apiClient.delete(`/properties/${id}`);
  return res.data;
};

/**
 * Get properties created by the current authenticated user
 * Backend route: GET /api/properties/mine
 */
export const getMyProperties = async (params = {}, config = {}) => {
  // allow passing pagination/sort params
  const res = await apiClient.get(`/properties/mine`, { ...config, params });
  return res.data; // { items, page, pages, total, limit }
};
