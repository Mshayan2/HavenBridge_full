const DEFAULT_API_HOST = "http://localhost:5000";

/**
 * Returns the API host without the trailing `/api`.
 * Example:
 *  - VITE_API_BASE="http://localhost:5000/api" -> "http://localhost:5000"
 */
export function getApiHost() {
  const base = import.meta.env.VITE_API_BASE || `${DEFAULT_API_HOST}/api`;
  // Strip a trailing /api (with optional slashes)
  const host = String(base).replace(/\/?api\/?$/, "");
  return host || DEFAULT_API_HOST;
}

/**
 * Convert an API-returned asset path into an absolute URL the browser can load.
 * Supports:
 *  - already absolute http(s)
 *  - web paths like /uploads/...
 *  - accidental filesystem paths (Windows backslashes)
 */
export function toAssetUrl(p, { fallback = "/vite.svg" } = {}) {
  if (!p) return fallback;
  const s = String(p);
  if (s.startsWith("http://") || s.startsWith("https://")) return s;

  const host = getApiHost();
  if (s.startsWith("/")) return `${host}${s}`;

  // If a filesystem-ish path slips through, use the basename.
  try {
    const parts = s.split(/\\\\|\//);
    const name = parts[parts.length - 1];
    return `${host}/uploads/${name}`;
  } catch {
    return `${host}/${s}`;
  }
}

