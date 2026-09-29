"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/context/AuthContext";

export default function LecturerNavbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  const displayName = user?.fullName || "Lecturer";
  const displayInitials = displayName.charAt(0).toUpperCase();
  const displaySub = user?.email || "Lecturer Portal";

  const links = [
    { href: "/lecturer/dashboard", label: "Dashboard" },
    { href: "/lecturer/courses", label: "Courses" },
    { href: "/lecturer/grading", label: "Grading" },
    { href: "/lecturer/exams", label: "Exams" },
    { href: "/lecturer/schedule", label: "Schedule" },
    { href: "/lecturer/announcement", label: "Announcement" },
    { href: "/lecturer/analytics", label: "Analytics" },
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setIsAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setIsAccountOpen(false);
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleLogout = () => {
    setIsOpen(false);
    setIsAccountOpen(false);
    logout();
  };

  return (
    <header className="glass sticky top-0 z-40 border-b border-[var(--glass-border)] px-4 sm:px-8 py-3">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4 md:gap-8">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--on-surface)] hover:bg-[var(--surface-container-low)] rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <i className={`ti ${isOpen ? "ti-x" : "ti-menu-2"} text-xl`}></i>
          </button>
          <Link href="/lecturer/dashboard" className="flex items-center gap-2 min-h-[44px]">
            <Logo />
            <span className="badge badge-accent text-[10px] hidden sm:inline-flex">LECTURER</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link ${isActive ? "active" : ""}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-1 sm:gap-3">
          <Link href="/notifications" className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] relative">
            <i className="ti ti-bell text-xl"></i>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[var(--tertiary)]"></span>
          </Link>
          <Link href="/messages" className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]">
            <i className="ti ti-message-dots text-xl"></i>
          </Link>
          <ThemeToggle />

          <div className="relative hidden sm:block" ref={accountRef}>
            <button
              onClick={() => setIsAccountOpen(!isAccountOpen)}
              className="flex items-center gap-2 pl-2 min-h-[44px] border-l border-[var(--outline-variant)] hover:opacity-80 transition-opacity"
              aria-label="Account menu"
            >
              <div className="avatar w-8 h-8 text-xs font-bold">{displayInitials}</div>
              <span className="text-xs font-semibold text-[var(--on-surface)] hidden lg:inline">{displayName}</span>
              <i className="ti ti-chevron-down text-xs text-[var(--on-surface-variant)]"></i>
            </button>

            {isAccountOpen && (
              <div className="absolute right-0 mt-2 w-56 glass rounded-2xl border border-[var(--glass-border)] shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <Link
                  href="/profile"
                  onClick={() => setIsAccountOpen(false)}
                  className="flex items-center gap-3 p-2.5 min-h-[44px] rounded-xl hover:bg-[var(--surface-container-low)] transition-colors"
                >
                  <div className="avatar w-8 h-8 text-xs font-bold">{displayInitials}</div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-[var(--on-surface)] truncate">{displayName}</p>
                    <p className="text-[11px] text-[var(--on-surface-variant)] truncate">{displaySub}</p>
                  </div>
                </Link>
                <div className="my-1 border-t border-[var(--outline-variant)]"></div>
                <Link
                  href="/profile"
                  onClick={() => setIsAccountOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 min-h-[44px] text-xs font-semibold text-[var(--on-surface)] rounded-xl hover:bg-[var(--surface-container-low)] transition-colors"
                >
                  <i className="ti ti-user text-base text-[var(--tertiary)]"></i>
                  <span>Profile Settings</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 min-h-[44px] text-xs font-semibold text-[var(--error)] rounded-xl hover:bg-[var(--error-container)]/30 transition-colors text-left"
                >
                  <i className="ti ti-logout text-base"></i>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 top-[60px] bg-black/40 z-30 md:hidden backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <nav className="relative z-40 md:hidden pt-3 pb-2 mt-2 border-t border-[var(--glass-border)] flex flex-col space-y-1 bg-[var(--surface)] px-1 rounded-2xl shadow-xl">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 p-2.5 min-h-[44px] rounded-xl bg-[var(--surface-container-low)] mb-2"
            >
              <div className="avatar w-8 h-8 text-xs font-bold">{displayInitials}</div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-[var(--on-surface)] truncate">{displayName}</p>
                <p className="text-[11px] text-[var(--on-surface-variant)] truncate">{displaySub}</p>
              </div>
            </Link>
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`sidebar-link min-h-[44px] flex items-center ${isActive ? "active" : ""}`}
                >
                  <span>{link.label}</span>
                </Link>
              );
            })}
            <div className="pt-2 border-t border-[var(--outline-variant)]">
              <button
                onClick={handleLogout}
                className="sidebar-link min-h-[44px] flex items-center w-full text-left text-[var(--error)] hover:bg-[var(--error-container)]/30"
              >
                <i className="ti ti-logout text-lg"></i>
                <span>Logout</span>
              </button>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
