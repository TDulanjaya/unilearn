"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState("nadeesha.s@uni.edu");
  const [password, setPassword] = useState("password123");
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/student/dashboard");
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setResetSent(true);
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

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@uni.edu"
                  required
                />
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
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button type="submit" className="btn-primary w-full justify-center !py-2.5 text-sm mt-2 shadow-md">
                Sign in
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-[var(--outline-variant)] text-center text-xs text-[var(--outline)]">
              Demo Role Jump:{" "}
              <Link href="/student/dashboard" className="text-[var(--tertiary)] font-medium hover:underline">
                Student
              </Link>{" "}
              ·{" "}
              <Link href="/lecturer/dashboard" className="text-[var(--tertiary)] font-medium hover:underline">
                Lecturer
              </Link>{" "}
              ·{" "}
              <Link href="/admin/dashboard" className="text-[var(--tertiary)] font-medium hover:underline">
                Admin
              </Link>
            </div>
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
                <i className="ti ti-circle-check text-2xl block mb-1"></i>
                Password reset link sent to <b>{email}</b>! Check your inbox.
              </div>
            ) : (
              <form onSubmit={handleForgot} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@uni.edu"
                    required
                  />
                </div>
                <button type="submit" className="btn-primary w-full justify-center !py-2.5 text-sm shadow-md">
                  Send reset link
                </button>
              </form>
            )}

            <button
              onClick={() => { setIsForgot(false); setResetSent(false); }}
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
