"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { api } from "@/lib/api";

function ResetPasswordFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(
    !token ? "Missing or invalid reset token link." : null
  );
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Missing or invalid reset token link.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await api.post("/api/v1/auth/reset-password", {
        token,
        newPassword,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. The link may have expired or been used.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--on-background)] flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      <div className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-gradient-to-tr from-[#0d1c2e] via-[#006a61] to-[#6bd8cb] opacity-25 blur-[100px] rounded-full pointer-events-none -z-10"></div>
      <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-gradient-to-tr from-[#006a61] to-[#4cd7f6] opacity-20 blur-[100px] rounded-full pointer-events-none -z-10"></div>

      <div className="absolute top-4 sm:top-6 right-4 sm:right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md glass rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-[var(--glass-border)] shadow-2xl">
        <div className="flex items-center gap-3 mb-6 justify-center">
          <Link href="/">
            <Logo />
          </Link>
        </div>

        <h2 className="font-display font-bold text-xl text-center mb-1 text-[var(--on-surface)]">
          Set new password
        </h2>
        <p className="text-[var(--on-surface-variant)] text-sm text-center mb-6">
          Enter your new password below to update your account
        </p>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2 font-medium mb-4">
            <i className="ti ti-alert-circle text-base shrink-0"></i>
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div>
            <div className="bg-[var(--secondary-container)] border border-[var(--outline-variant)] rounded-xl p-4 text-center text-sm text-[var(--on-secondary-container)] mb-6">
              <i className="ti ti-circle-check text-3xl block mb-2 text-[var(--tertiary)]"></i>
              Your password has been successfully reset!
            </div>
            <Link
              href="/login"
              className="btn-primary w-full justify-center !py-2.5 text-sm shadow-md block text-center"
            >
              Sign in with new password
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">
                New password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] focus:outline-none focus:border-[var(--tertiary)]"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-colors p-1"
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  <i className={`ti ${showNewPassword ? "ti-eye-off" : "ti-eye"} text-base`}></i>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">
                Confirm new password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] focus:outline-none focus:border-[var(--tertiary)]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-colors p-1"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  <i className={`ti ${showConfirmPassword ? "ti-eye-off" : "ti-eye"} text-base`}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !token}
              className="btn-primary w-full justify-center !py-2.5 text-sm shadow-md disabled:opacity-50"
            >
              {isSubmitting ? "Resetting..." : "Reset password"}
            </button>

            <Link
              href="/login"
              className="btn-secondary w-full justify-center !py-2 text-xs block text-center mt-2"
            >
              Back to Sign in
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs">Loading...</div>}>
      <ResetPasswordFormContent />
    </Suspense>
  );
}
