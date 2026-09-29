import { getToken, setToken, getUser, setUser, clearAuth } from "./auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

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

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers,
  });

  if (response.status === 401) {
    try {
      const refreshUrl = `${BASE_URL}/api/v1/auth/refresh`;
      const refreshRes = await fetch(refreshUrl, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        setToken(refreshData.accessToken);
        const currentUser = getUser();
        if (currentUser) {
          currentUser.token = refreshData.accessToken;
          setUser(currentUser);
        }
        // Retry original request with new token
        headers["Authorization"] = `Bearer ${refreshData.accessToken}`;
        const retryResponse = await fetch(url, {
          ...options,
          credentials: "include",
          headers,
        });
        if (retryResponse.status === 204) {
          return null as T;
        }
        if (retryResponse.ok) {
          const contentType = retryResponse.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            return (await retryResponse.json()) as T;
          } else {
            return (await retryResponse.text()) as unknown as T;
          }
        }
      }
    } catch (err) {
      console.error("Token refresh failed:", err);
    }

    clearAuth();
    if (
      typeof window !== "undefined" &&
      window.location.pathname !== "/" &&
      !window.location.pathname.startsWith("/login") &&
      !window.location.pathname.startsWith("/reset-password")
    ) {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized access. Redirecting to login...");
  }

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
