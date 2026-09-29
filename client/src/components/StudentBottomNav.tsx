"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function StudentBottomNav() {
  const pathname = usePathname();

  // hide outside student portal
  if (!pathname?.startsWith("/student") && pathname !== "/profile") {
    return null;
  }

  const items = [
    { href: "/student/dashboard", label: "Home", icon: "ti-layout-dashboard" },
    { href: "/student/courses", label: "Courses", icon: "ti-book" },
    { href: "/student/exams", label: "Exams", icon: "ti-file-certificate" },
    { href: "/student/ai-assistant", label: "AI Tutor", icon: "ti-sparkles" },
    { href: "/profile", label: "Profile", icon: "ti-user" },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface-container-lowest)]/95 dark:bg-[#070f1e]/95 backdrop-blur-lg border-t border-[var(--outline-variant)] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1 safe-area-bottom"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === "/student/courses" && pathname?.startsWith("/student/courses/"));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-xl transition-all ${
                isActive
                  ? "text-[var(--tertiary)] font-bold scale-105"
                  : "text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
              }`}
            >
              <div className="relative flex items-center justify-center">
                <i className={`ti ${item.icon} text-xl`}></i>
                {isActive && (
                  <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[var(--tertiary)]" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
