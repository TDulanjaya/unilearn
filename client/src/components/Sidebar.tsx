"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

interface SidebarProps {
  role: "admin" | "hod";
  name: string;
  sub: string;
}

export default function Sidebar({ role, name, sub }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const linksByRole = {
    admin: [
      { href: "/admin/dashboard", label: "Dashboard", icon: "ti-layout-dashboard" },
      { href: "/admin/user-management", label: "User management", icon: "ti-users" },
      { href: "/admin/academic-structure", label: "Academic structure", icon: "ti-building-bank" },
      { href: "/admin/events-enrollment", label: "Events & Announcements", icon: "ti-calendar-event" },
      { href: "/admin/exam-scheduling", label: "Exam scheduling", icon: "ti-calendar-time" },
      { href: "/admin/reports-settings", label: "Reports & settings", icon: "ti-settings" },
    ],
    hod: [
      { href: "/hod/dashboard", label: "Dashboard", icon: "ti-layout-dashboard" },
      { href: "/hod/announcement", label: "Announcement", icon: "ti-speakerphone" },
    ],
  };

  const links = linksByRole[role] || [];
  const initial = name ? name.charAt(0) : "U";

  const renderNavContent = () => (
    <div className="flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between gap-2 mb-6">
          <Link href="/" onClick={() => setIsOpen(false)}>
            <Logo />
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2 text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
              aria-label="Close menu"
            >
              <i className="ti ti-x text-xl"></i>
            </button>
          </div>
        </div>

        <div className="mb-6 px-3 py-2.5 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]">
          <div className="flex items-center gap-2.5">
            <div className="avatar w-8 h-8 text-xs">{initial}</div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-[var(--on-surface)] truncate">{name}</p>
              <p className="text-[11px] text-[var(--on-surface-variant)] truncate">{sub}</p>
            </div>
          </div>
        </div>

        <nav className="space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`sidebar-link ${isActive ? "active" : ""}`}
              >
                <i className={`ti ${link.icon} text-lg`}></i>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-[var(--outline-variant)]">
        <Link
          href="/login"
          onClick={() => setIsOpen(false)}
          className="sidebar-link text-[var(--error)] hover:bg-[var(--error-container)]"
        >
          <i className="ti ti-logout text-lg"></i>
          <span>Logout</span>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      
      <div className="lg:hidden w-full glass border-b border-[var(--glass-border)] px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 text-[var(--on-surface)] hover:bg-[var(--surface-container-low)] rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <i className="ti ti-menu-2 text-2xl"></i>
          </button>
          <Link href="/">
            <Logo />
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="avatar w-7 h-7 text-xs">{initial}</div>
        </div>
      </div>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
        />
      )}

      <div
        className={`lg:hidden fixed top-0 left-0 bottom-0 z-50 w-72 glass border-r border-[var(--glass-border)] p-5 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {renderNavContent()}
      </div>

      <aside className="hidden lg:flex w-64 glass border-r border-[var(--glass-border)] p-5 flex-col justify-between shrink-0 sticky top-0 h-screen overflow-y-auto">
        {renderNavContent()}
      </aside>
    </>
  );
}
