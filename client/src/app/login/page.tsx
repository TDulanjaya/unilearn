"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
    <div className="min-h-screen bg-[#F6F7FB] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-[#E7E8F0] rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 justify-center">
          <div className="w-10 h-10 rounded-xl bg-accent text-white font-display font-extrabold flex items-center justify-center text-xl shadow-sm">
            U
          </div>
          <span className="font-display font-extrabold text-2xl">UniLearn</span>
        </div>

        {!isForgot ? (
          <div>
            <h2 className="font-display font-bold text-xl text-center mb-1">Welcome back</h2>
            <p className="text-[#666B80] text-sm text-center mb-6">Sign in to your university LMS account</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#666B80] mb-1">Email address</label>
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
                  <label className="block text-xs font-semibold text-[#666B80]">Password</label>
                  <button
                    type="button"
                    onClick={() => setIsForgot(true)}
                    className="text-xs text-accent font-semibold hover:underline"
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

              <button type="submit" className="btn-primary w-full justify-center !py-2.5 text-sm mt-2">
                Sign in
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-[#E7E8F0] text-center text-xs text-[#9CA0B3]">
              Demo Role Jump: <Link href="/student/dashboard" className="text-accent font-medium">Student</Link> · <Link href="/lecturer/dashboard" className="text-accent font-medium">Lecturer</Link> · <Link href="/admin/dashboard" className="text-accent font-medium">Admin</Link>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="font-display font-bold text-xl text-center mb-1">Reset password</h2>
            <p className="text-[#666B80] text-sm text-center mb-6">Enter your email to receive recovery instructions</p>

            {resetSent ? (
              <div className="bg-[#DCFCE7] border border-[#16A34A] rounded-xl p-4 text-center text-sm text-[#166534] mb-6">
                <i className="ti ti-circle-check text-2xl block mb-1"></i>
                Password reset link sent to <b>{email}</b>! Check your inbox.
              </div>
            ) : (
              <form onSubmit={handleForgot} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#666B80] mb-1">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@uni.edu"
                    required
                  />
                </div>
                <button type="submit" className="btn-primary w-full justify-center !py-2.5 text-sm">
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
