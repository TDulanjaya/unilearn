"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export function PasswordChangeGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isBypassedRoute = pathname === "/change-password" || pathname === "/login";

  useEffect(() => {
    if (!isLoading && user?.mustChangePassword) {
      if (!isBypassedRoute) {
        router.replace("/change-password");
      }
    }
  }, [user, isLoading, pathname, router, isBypassedRoute]);

  if (!isLoading && user?.mustChangePassword && !isBypassedRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
        <div className="max-w-md w-full p-5 sm:p-8 rounded-2xl bg-[var(--surface)] border border-[var(--outline)] shadow-2xl text-center space-y-5 sm:space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto text-2xl font-bold border border-amber-500/20">
            <i className="ti ti-lock-exclamation" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[var(--on-surface)]">Action Required: Change Password</h2>
            <p className="mt-2 text-xs sm:text-sm text-[var(--on-surface-variant)] leading-relaxed">
              Your account has a temporary or administrative password. For security compliance, you must set a new password before accessing any UniLearn features.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/change-password"
              className="inline-flex items-center justify-center w-full px-5 py-3 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-semibold shadow-md hover:opacity-95 transition-all min-h-[48px]"
            >
              Update Password Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
