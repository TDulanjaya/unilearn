"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

export default function LecturerNavbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: "/lecturer/dashboard", label: "Dashboard" },
    { href: "/lecturer/courses", label: "Courses" },
    { href: "/lecturer/grading", label: "Grading" },
    { href: "/lecturer/schedule", label: "Schedule" },
    { href: "/lecturer/announcement", label: "Announcement" },
    { href: "/lecturer/analytics", label: "Analytics" },
  ];

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
          <Link href="/lecturer/dashboard" className="flex items-center gap-2">
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

        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/notifications" className="p-2 text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] relative">
            <i className="ti ti-bell text-xl"></i>
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--tertiary)]"></span>
          </Link>
          <Link href="/messages" className="p-2 text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]">
            <i className="ti ti-message-dots text-xl"></i>
          </Link>
          <ThemeToggle />
          <Link href="/profile" className="flex items-center gap-2 pl-2 border-l border-[var(--outline-variant)]">
            <div className="avatar w-8 h-8 text-xs">KP</div>
            <span className="text-xs font-semibold text-[var(--on-surface)] hidden sm:inline">Dr. K. Perera</span>
          </Link>
        </div>
      </div>

      {isOpen && (
        <nav className="md:hidden pt-3 pb-2 mt-2 border-t border-[var(--glass-border)] flex flex-col space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`sidebar-link ${isActive ? "active" : ""}`}
              >
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
