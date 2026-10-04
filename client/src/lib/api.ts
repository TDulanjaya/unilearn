import { getToken, setToken, getUser, setUser, clearAuth } from "./auth";

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// One refresh at a time, other requests wait for it
let refreshPromise: Promise<string | null> | null = null;

export async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) return null;
        const data = await res.json();
        setToken(data.accessToken);
        const currentUser = getUser();
        if (currentUser) {
          currentUser.token = data.accessToken;
          setUser(currentUser);
        }
        return data.accessToken as string;
      } catch (err) {
        console.error("Token refresh failed:", err);
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

export function toApiUrl(endpoint: string): string {
  return endpoint.startsWith("http")
    ? endpoint
    : `${BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
}

function sendToLogin() {
  clearAuth();
  if (
    typeof window !== "undefined" &&
    window.location.pathname !== "/" &&
    !window.location.pathname.startsWith("/login")
  ) {
    window.location.href = "/login";
  }
}

async function readResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return null as T;
  }

  let data: any;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage =
      typeof data === "object" && data !== null
        ? data.message || data.error || response.statusText
        : data || `HTTP error ${response.status}`;
    throw new Error(errorMessage);
  }

  return data as T;
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = toApiUrl(endpoint);

  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers,
  });

  // Login/refresh errors (like a wrong password) should show the real message
  const isAuthCall = url.includes("/api/v1/auth/login") || url.includes("/api/v1/auth/refresh");

  if (response.status === 401 && !isAuthCall) {
    const newToken = await refreshAccessToken();
    if (!newToken) {
      sendToLogin();
      throw new Error("Your session has expired. Please sign in again.");
    }

    // Try again with the new token
    headers["Authorization"] = `Bearer ${newToken}`;
    const retryResponse = await fetch(url, {
      ...options,
      credentials: "include",
      headers,
    });

    if (retryResponse.status === 401) {
      sendToLogin();
      throw new Error("Your session has expired. Please sign in again.");
    }

    // Other errors (400, 403, 409...) are shown normally, no logout
    return readResponse<T>(retryResponse);
  }

  return readResponse<T>(response);
}

export const api = {
  get: <T = any>(endpoint: string, options?: RequestInit) =>
    apiFetch<T>(endpoint, { ...options, method: "GET" }),

  post: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  put: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  patch: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  delete: <T = any>(endpoint: string, options?: RequestInit) =>
    apiFetch<T>(endpoint, { ...options, method: "DELETE" }),
};
