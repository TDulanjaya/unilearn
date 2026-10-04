"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export default function ChangePasswordPage() {
  const { user, logout, markPasswordChanged } = useAuth();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getDashboardPath = (role?: string) => {
    const r = (role || "").toLowerCase();
    if (r.includes("admin")) return "/admin/user-management";
    if (r.includes("lecturer")) return "/lecturer/dashboard";
    if (r.includes("hod") || r.includes("dean")) return "/hod/dashboard";
    return "/student/dashboard";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!currentPassword) {
      setError("Please enter your current temporary or assigned password.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }
    if (newPassword === currentPassword) {
      setError("New password cannot be the same as your temporary password.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post<{ message?: string; accessToken?: string }>("/api/v1/auth/change-password", {
        currentPassword,
        newPassword,
      });
      // old tokens stop working after a password change, use the new one
      markPasswordChanged(res?.accessToken);
      setSuccess("Password updated successfully! Redirecting to your dashboard...");

      setTimeout(() => {
        router.push(getDashboardPath(user?.role));
      }, 1500);
    } catch (err: any) {
      setError(err?.message || "Failed to update password. Please check your current password and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4 py-8 sm:py-12">
      <div className="max-w-md w-full">
        {/* Logo / Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] mb-4 border border-[var(--primary)]/20 shadow-sm">
            <i className="ti ti-shield-lock text-3xl" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--on-surface)]">
            Set Your New Password
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[var(--on-surface-variant)]">
            {user?.fullName ? `Welcome, ${user.fullName}. ` : ""}
            Please configure a secure personal password to continue.
          </p>
        </div>

        {/* Card */}
        <div className="bg-[var(--surface)] border border-[var(--outline)] rounded-2xl shadow-xl p-5 sm:p-8 backdrop-blur-sm">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-start gap-3">
              <i className="ti ti-alert-circle text-lg shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm flex items-start gap-3">
              <i className="ti ti-circle-check text-lg shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--on-surface-variant)] mb-1.5">
                Current / Temporary Password
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current or temporary password"
                  required
                  className="w-full px-4 py-2.5 pr-10 rounded-xl bg-[var(--surface-variant)]/40 border border-[var(--outline)] text-[var(--on-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 transition-all placeholder:text-[var(--on-surface-variant)]/50"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-colors"
                >
                  <i className={`ti ${showCurrent ? "ti-eye-off" : "ti-eye"}`} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--on-surface-variant)] mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="w-full px-4 py-2.5 pr-10 rounded-xl bg-[var(--surface-variant)]/40 border border-[var(--outline)] text-[var(--on-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 transition-all placeholder:text-[var(--on-surface-variant)]/50"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-colors"
                >
                  <i className={`ti ${showNew ? "ti-eye-off" : "ti-eye"}`} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--on-surface-variant)] mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  className="w-full px-4 py-2.5 pr-10 rounded-xl bg-[var(--surface-variant)]/40 border border-[var(--outline)] text-[var(--on-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 transition-all placeholder:text-[var(--on-surface-variant)]/50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-colors"
                >
                  <i className={`ti ${showConfirm ? "ti-eye-off" : "ti-eye"}`} />
                </button>
              </div>
            </div>

            <div className="pt-2 space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-semibold shadow-md hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <i className="ti ti-loader animate-spin" />
                    <span>Updating password...</span>
                  </>
                ) : (
                  <>
                    <i className="ti ti-check" />
                    <span>Save & Continue</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => logout()}
                className="w-full py-2.5 px-4 rounded-xl border border-[var(--outline)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-variant)]/30 text-sm font-medium transition-colors"
              >
                Sign Out
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
