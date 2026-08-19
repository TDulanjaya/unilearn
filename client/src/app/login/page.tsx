"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Logo from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const { login } = useAuth();

  const [isForgot, setIsForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("user.s@uni.edu");
  const [resetSent, setResetSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(
    errorParam === "unauthorized" ? "Please sign in to access this page." : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "user.s@uni.edu",
      password: "password123",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    setIsSubmitting(true);
    try {
      const res = await login(data.email, data.password);
      const role = res.role?.toUpperCase();
      if (role === "STUDENT") {
        router.push("/student/dashboard");
      } else if (role === "LECTURER") {
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

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setIsSubmitting(true);
    try {
      await api.post("/api/v1/auth/forgot-password", { email: resetEmail });
      setResetSent(true);
    } catch (err: any) {
      setServerError(err.message || "Failed to send reset link.");
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

      <div className="w-full max-w-md glass rounded-3xl p-6 sm:p-8 border border-[var(--glass-border)] shadow-2xl">
        <div className="flex items-center gap-3 mb-6 justify-center">
          <Link href="/">
            <Logo />
          </Link>
        </div>

        {!isForgot ? (
          <div>
            <h2 className="font-display font-bold text-xl text-center mb-1 text-[var(--on-surface)]">
              Welcome back
            </h2>
            <p className="text-[var(--on-surface-variant)] text-sm text-center mb-6">
              Sign in to your university LMS account
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                  type="email"
                  {...register("email")}
                  placeholder="student@uni.edu"
                  className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-[var(--surface-container-lowest)] focus:outline-none transition-colors ${
                    errors.email
                      ? "border-red-500 focus:border-red-500"
                      : "border-[var(--outline-variant)] focus:border-[var(--tertiary)]"
                  }`}
                />
                {errors.email && (
                  <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                    <i className="ti ti-alert-circle"></i> {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[var(--on-surface-variant)]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgot(true)}
                    className="text-xs text-[var(--tertiary)] font-semibold hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder="••••••••"
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
                    <i className="ti ti-alert-circle"></i> {errors.password.message}
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
            </form>
          </div>
        ) : (
          <div>
            <h2 className="font-display font-bold text-xl text-center mb-1 text-[var(--on-surface)]">
              Reset password
            </h2>
            <p className="text-[var(--on-surface-variant)] text-sm text-center mb-6">
              Enter your email to receive recovery instructions
            </p>

            {resetSent ? (
              <div className="bg-[var(--secondary-container)] border border-[var(--outline-variant)] rounded-xl p-4 text-center text-sm text-[var(--on-secondary-container)] mb-6">
                <i className="ti ti-circle-check text-2xl block mb-1 text-[var(--tertiary)]"></i>
                Password reset link sent to <b>{resetEmail}</b>! Check your inbox or dev logs.
              </div>
            ) : (
              <form onSubmit={handleForgot} className="space-y-4">
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
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="student@uni.edu"
                    required
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] focus:outline-none focus:border-[var(--tertiary)]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full justify-center !py-2.5 text-sm shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? "Sending..." : "Send reset link"}
                </button>
              </form>
            )}

            <button
              onClick={() => {
                setIsForgot(false);
                setResetSent(false);
                setServerError(null);
              }}
              className="btn-secondary w-full justify-center !py-2 text-xs mt-4"
            >
              Back to Sign in
            </button>
          </div>
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
