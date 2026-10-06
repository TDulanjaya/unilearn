"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import Logo from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const { login } = useAuth();
  const { verifySuperAdminOtp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(
    errorParam === "unauthorized" ? "Please sign in to access this page." : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [otp, setOtp] = useState("");

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError(null);

    const validationResult = loginSchema.safeParse({ email, password });
    if (!validationResult.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      for (const issue of validationResult.error.issues) {
        if (issue.path[0] === "email" && !fieldErrors.email) {
          fieldErrors.email = issue.message;
        }
        if (issue.path[0] === "password" && !fieldErrors.password) {
          fieldErrors.password = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      const res = await login(email.trim(), password);
      if (res.otpRequired && res.challengeId) {
        setChallengeId(res.challengeId);
        setServerError(null);
        return;
      }
      const role = res.role?.toUpperCase();
      if (role === "STUDENT") {
        router.push("/student/dashboard");
      } else if (role === "LECTURER" || role === "GUEST_LECTURER") {
        router.push("/lecturer/dashboard");
      } else if (role === "HOD_DEAN") {
        router.push("/hod/dashboard");
      } else {
        router.push("/admin/dashboard");
      }
    } catch (err: any) {
      setServerError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onVerifyOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!challengeId || !/^\d{6}$/.test(otp)) {
      setServerError("Enter the 6-digit verification code.");
      return;
    }
    setServerError(null);
    setIsSubmitting(true);
    try {
      const res = await verifySuperAdminOtp(challengeId, otp);
      router.push(res.role?.toUpperCase() === "SUPER_ADMIN" ? "/admin/dashboard" : "/");
    } catch (err: any) {
      setServerError(err.message || "Verification failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--on-background)] flex flex-col items-center justify-center p-4 sm:p-8 relative isolate overflow-hidden">
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
          Welcome back
        </h2>
        <p className="text-[var(--on-surface-variant)] text-sm text-center mb-6">
          {challengeId ? "Enter the verification code sent to the superadmin email." : "Sign in to your university LMS account"}
        </p>

        {challengeId ? (
          <form key="otp-form" onSubmit={onVerifyOtp} className="space-y-4">
            {serverError && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs">{serverError}</div>}
            <div>
              <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">Verification code</label>
              <input
                key="otp-code-input"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
                placeholder="Enter 6-digit code"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]"
              />
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center !py-2.5 text-sm shadow-md disabled:opacity-50">
              {isSubmitting ? "Verifying..." : "Verify and sign in"}
            </button>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[var(--on-surface-variant)] text-[11px] leading-relaxed">
              <span className="font-semibold text-amber-600 dark:text-amber-400">Didn&apos;t receive the email?</span>
              <p className="mt-0.5">Please check your <strong>Spam / Junk</strong> folder or search <code>in:anywhere UniLearn</code> in Gmail.</p>
            </div>
            <button
              type="button"
              onClick={() => { setChallengeId(null); setOtp(""); setServerError(null); }}
              className="w-full text-center text-xs text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-colors py-1"
            >
              ← Back to sign in
            </button>
          </form>
        ) : (
          <form key="login-form" onSubmit={onSubmit} className="space-y-4">
            {serverError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2 font-medium">
                <i className="ti ti-alert-circle text-base shrink-0"></i>
                <span>{serverError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">
                Email address
              </label>
              <input
                key="login-email-input"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="Enter your email address"
                className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-[var(--surface-container-lowest)] focus:outline-none transition-colors ${
                  errors.email
                    ? "border-red-500 focus:border-red-500"
                    : "border-[var(--outline-variant)] focus:border-[var(--tertiary)]"
                }`}
              />
              {errors.email && (
                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                  <i className="ti ti-alert-circle"></i> {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  key="login-password-input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="Enter your password"
                  className={`w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border bg-[var(--surface-container-lowest)] focus:outline-none transition-colors ${
                    errors.password
                      ? "border-red-500 focus:border-red-500"
                      : "border-[var(--outline-variant)] focus:border-[var(--tertiary)]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-colors p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <i className={`ti ${showPassword ? "ti-eye-off" : "ti-eye"} text-base`}></i>
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                  <i className="ti ti-alert-circle"></i> {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full justify-center !py-2.5 text-sm mt-2 shadow-md disabled:opacity-50"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>

            <p className="text-center text-xs text-[var(--on-surface-variant)] mt-3">
              Forgot your password? Contact your administrator.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs">Loading...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
