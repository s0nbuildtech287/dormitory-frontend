const RAW_BACKEND_URL =
  (import.meta.env.VITE_BACKEND_URL || "").trim() ||
  "http://localhost:1234";

const normalizedOrigin = RAW_BACKEND_URL.replace(/\/+$/, "");
const normalizedApiUrl = normalizedOrigin.endsWith("/api")
  ? normalizedOrigin
  : `${normalizedOrigin}/api`;

export const BACKEND_URL = normalizedOrigin.endsWith("/api")
  ? normalizedOrigin.slice(0, -4)
  : normalizedOrigin;

export const API_BASE_URL = normalizedApiUrl;
export const SOCKET_URL = BACKEND_URL;
