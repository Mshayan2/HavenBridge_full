// Lightweight fetch-based API client that preserves the axios-like
// interface used across the project (i.e. methods return an object
// with a `data` property). This avoids adding the `axios` package.

// Read base URL from Vite env var if provided, otherwise default to localhost:5000
const BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

async function request(
  path,
  { method = "GET", body = undefined, headers = {}, signal = undefined, params = undefined } = {}
) {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  // Support axios-style `params` by appending to the URL.
  let finalPath = path;
  if (params && typeof params === "object") {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null) continue;
      if (Array.isArray(v)) {
        for (const item of v) {
          if (item === undefined || item === null) continue;
          sp.append(k, String(item));
        }
      } else {
        sp.set(k, String(v));
      }
    }
    const qs = sp.toString();
    if (qs) {
      finalPath = `${path}${path.includes("?") ? "&" : "?"}${qs}`;
    }
  }

  // If body is not FormData, stringify and set JSON header
  let fetchBody = body;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  if (!isFormData && body && typeof body === "object") {
    fetchBody = JSON.stringify(body);
    headers = { "Content-Type": "application/json", ...headers };
  }

  if (token) {
    headers = { Authorization: `Bearer ${token}`, ...headers };
  }

  // Always request fresh API data (avoid browser cache returning 304 and stale UI)
  headers = {
    Accept: "application/json",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    ...headers,
  };

  let res;
  try {
    res = await fetch(`${BASE_URL}${finalPath}`, {
      method,
      headers,
      body: fetchBody,
      cache: "no-store",
      signal,
    });
  } catch (err) {
    // If the request was cancelled, surface a consistent abort error.
    if (err?.name === "AbortError") {
      const error = new Error("Request aborted");
      error.data = null;
      error.status = 0;
      error.aborted = true;
      throw error;
    }
    const error = new Error(
      `Network error: cannot reach API at ${BASE_URL}. Is the backend running? (${err.message})`
    );
    error.data = null;
    error.status = 0;
    throw error;
  }

  // If fetch itself throws (network error), normalize

  // Try to parse JSON (some endpoints may return empty responses)
  let data = null;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    try {
      data = await res.json();
    } catch (_e) {
      data = null;
    }
  }

  if (!res.ok) {
    // Normalize error to be similar to axios behavior
    const message = (data && data.message) || res.statusText || "API error";
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return { data };
}

const apiClient = {
  get: (path, config) => request(path, { method: "GET", ...config }),
  post: (path, body, config) => request(path, { method: "POST", body, ...config }),
  put: (path, body, config) => request(path, { method: "PUT", body, ...config }),
  delete: (path, config) => request(path, { method: "DELETE", ...config }),
};

export default apiClient;
