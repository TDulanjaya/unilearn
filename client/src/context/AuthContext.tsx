"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { setToken, setUser, clearAuth, AuthUser } from "@/lib/auth";

export interface AuthResponse {
  token?: string;
  tokenType?: string;
  userId?: number;
  fullName?: string;
  email?: string;
  role?: string;
  status?: string;
  mustChangePassword?: boolean;
  otpRequired?: boolean;
  challengeId?: string;
  message?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  verifySuperAdminOtp: (challengeId: string, otp: string) => Promise<AuthResponse>;
  logout: () => void;
  markPasswordChanged: (newToken?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
          const data = await res.json();
          setToken(data.accessToken);
          setTokenState(data.accessToken);

          const userInfo: AuthUser = {
            userId: data.userId,
            fullName: data.fullName,
            email: data.email,
            role: data.role,
            status: data.status,
            token: data.accessToken,
            mustChangePassword: data.mustChangePassword,
          };
          setUser(userInfo);
          setUserState(userInfo);
        } else {
          clearAuth();
          setTokenState(null);
          setUserState(null);
        }
      } catch (err) {
        clearAuth();
        setTokenState(null);
        setUserState(null);
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    const res = await apiFetch<AuthResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (res.otpRequired) {
      return res;
    }

    if (!res.token || !res.userId || !res.fullName || !res.email || !res.role || !res.status) {
      throw new Error("Login response was incomplete.");
    }

    const userInfo: AuthUser = {
      userId: res.userId,
      fullName: res.fullName,
      email: res.email,
      role: res.role,
      status: res.status,
      tokenType: res.tokenType,
      token: res.token,
      mustChangePassword: res.mustChangePassword,
    };

    setToken(res.token);
    setUser(userInfo);
    setTokenState(res.token);
    setUserState(userInfo);

    return res;
  };

  const verifySuperAdminOtp = async (challengeId: string, otp: string): Promise<AuthResponse> => {
    const res = await apiFetch<AuthResponse>("/api/v1/auth/superadmin/verify-otp", {
      method: "POST",
      body: JSON.stringify({ challengeId, otp }),
    });
    if (!res.token || !res.userId || !res.fullName || !res.email || !res.role || !res.status) {
      throw new Error("Verification response was incomplete.");
    }
    const userInfo: AuthUser = {
      userId: res.userId,
      fullName: res.fullName,
      email: res.email,
      role: res.role,
      status: res.status,
      tokenType: res.tokenType,
      token: res.token,
      mustChangePassword: res.mustChangePassword,
    };
    setToken(res.token);
    setUser(userInfo);
    setTokenState(res.token);
    setUserState(userInfo);
    return res;
  };

  const logout = async () => {
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      await fetch(`${BASE_URL}/api/v1/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (e) {
      console.error("Logout error:", e);
    }
    clearAuth();
    setToken(null);
    setTokenState(null);
    setUser(null);
    setUserState(null);
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  // after a password change the server sends a new token, keep it everywhere
  const markPasswordChanged = (newToken?: string) => {
    if (newToken) {
      setToken(newToken);
      setTokenState(newToken);
    }
    if (user) {
      const updated: AuthUser = { ...user, mustChangePassword: false, ...(newToken ? { token: newToken } : {}) };
      setUser(updated);
      setUserState(updated);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        verifySuperAdminOtp,
        logout,
        markPasswordChanged,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
