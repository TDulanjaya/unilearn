"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/context/AuthContext";

export default function StudentNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  const displayName = user?.fullName || "Student";
  const displayInitials = displayName.charAt(0).toUpperCase();
  const displaySub = user?.email || "Student Portal";

  const links = [
    { href: "/student/dashboard", label: "Dashboard" },
    { href: "/student/courses", label: "Courses" },
    { href: "/student/exams", label: "Exams" },
    { href: "/student/timetable", label: "Timetable" },
    { href: "/student/attendance", label: "Attendance" },
    { href: "/student/records", label: "Records" },
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
            className="md:hidden p-2 text-[var(--on-surface)] hover:bg-[var(--surface-container-low)] rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <i className={`ti ${isOpen ? "ti-x" : "ti-menu-2"} text-xl`}></i>
          </button>
          <Link href="/student/dashboard" className="flex items-center gap-2">
            <Logo />
            <span className="badge badge-accent text-[10px] hidden sm:inline-flex">STUDENT</span>
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

        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/notifications" className="p-2 text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] relative">
            <i className="ti ti-bell text-xl"></i>
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--tertiary)]"></span>
          </Link>
          <Link href="/messages" className="p-2 text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]">
            <i className="ti ti-message-dots text-xl"></i>
          </Link>
          <ThemeToggle />

          <div className="relative hidden sm:block" ref={accountRef}>
            <button
              onClick={() => setIsAccountOpen(!isAccountOpen)}
              className="flex items-center gap-2 pl-2 border-l border-[var(--outline-variant)] hover:opacity-80 transition-opacity"
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
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--surface-container-low)] transition-colors"
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
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[var(--on-surface)] rounded-xl hover:bg-[var(--surface-container-low)] transition-colors"
                >
                  <i className="ti ti-user text-base text-[var(--tertiary)]"></i>
                  <span>Profile Settings</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[var(--error)] rounded-xl hover:bg-[var(--error-container)]/30 transition-colors text-left"
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
            onClick={() => setIsOpen(false)}
            className="md:hidden fixed inset-0 top-[60px] z-30 bg-black/50 backdrop-blur-sm transition-opacity"
          />
          <nav className="md:hidden pt-3 pb-2 mt-2 border-t border-[var(--glass-border)] flex flex-col space-y-1 relative z-40 max-h-[calc(100vh-80px)] overflow-y-auto">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 p-2.5 min-h-[44px] rounded-xl bg-[var(--surface-container-low)] mb-2"
            >
              <div className="avatar w-8 h-8 text-xs font-bold shrink-0">{displayInitials}</div>
              <div className="overflow-hidden min-w-0">
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
                  className={`sidebar-link min-h-[44px] ${isActive ? "active" : ""}`}
                >
                  <span>{link.label}</span>
                </Link>
              );
            })}
            <div className="pt-2 border-t border-[var(--outline-variant)]">
              <button
                onClick={handleLogout}
                className="sidebar-link min-h-[44px] w-full text-left text-[var(--error)] hover:bg-[var(--error-container)]/30"
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
