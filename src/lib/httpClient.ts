import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Origin the API is served from, e.g. "http://localhost:5000" — useful for
// building URLs to non-/api static assets like uploaded product images.
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

const TOKEN_KEY = "pa_admin_token";

export const authToken = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export const http = axios.create({ baseURL: API_URL });

http.interceptors.request.use((config) => {
  const token = authToken.get();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface ApiSuccess<T> {
  success: true;
  data: T;
}
export interface ApiFailure {
  success: false;
  message: string;
}

/**
 * Unwraps the backend's { success, data } / { success: false, message }
 * envelope. Network/server errors are turned into the same
 * ApiFailure-shaped message so callers only ever deal with one failure
 * path, matching how the rest of this file already handles "not found".
 */
export async function unwrap<T>(promise: Promise<{ data: ApiSuccess<T> | ApiFailure }>): Promise<T> {
  try {
    const { data: body } = await promise;
    if (body.success) return body.data;
    throw new Error(body.message || "Request failed.");
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const message = (err.response?.data as ApiFailure | undefined)?.message;
      throw new Error(message || "Could not reach the server. Please try again.");
    }
    throw err;
  }
}
