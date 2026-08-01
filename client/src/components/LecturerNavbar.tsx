"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function LecturerNavbar() {
  const pathname = usePathname();

  const links = [
    { href: "/lecturer/dashboard", label: "Dashboard" },
    { href: "/lecturer/courses", label: "Courses" },
    { href: "/lecturer/grading", label: "Grading" },
    { href: "/lecturer/schedule", label: "Schedule" },
    { href: "/lecturer/analytics", label: "Analytics" },
    { href: "/lecturer/announcement", label: "Announcements" },
  ];

  return (
    <header className="bg-white border-b border-[#E7E8F0] px-8 py-3 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-8">
        <Link href="/lecturer/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent text-white font-display font-extrabold flex items-center justify-center text-lg">
            U
          </div>
          <span className="font-display font-extrabold text-lg">UniLearn</span>
          <span className="badge badge-gray text-[10px]">LECTURER</span>
        </Link>
        <nav className="flex items-center gap-6">
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
      <div className="flex items-center gap-4">
        <Link href="/notifications" className="p-2 text-[#666B80] hover:text-ink relative">
          <i className="ti ti-bell text-xl"></i>
        </Link>
        <Link href="/messages" className="p-2 text-[#666B80] hover:text-ink">
          <i className="ti ti-message-dots text-xl"></i>
        </Link>
        <Link href="/profile" className="flex items-center gap-2 pl-2 border-l border-[#E7E8F0]">
          <div className="avatar w-8 h-8 text-xs">D</div>
          <span className="text-xs font-semibold text-ink">Dr. K. Perera</span>
        </Link>
      </div>
    </header>
  );
}
