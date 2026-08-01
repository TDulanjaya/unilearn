"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  role: "admin" | "examiner" | "hod";
  name: string;
  sub: string;
}

export default function Sidebar({ role, name, sub }: SidebarProps) {
  const pathname = usePathname();

  const linksByRole = {
    admin: [
      { href: "/admin/dashboard", label: "Dashboard", icon: "ti-layout-dashboard" },
      { href: "/admin/user-management", label: "User management", icon: "ti-users" },
      { href: "/admin/academic-structure", label: "Academic structure", icon: "ti-building-bank" },
      { href: "/admin/events-enrollment", label: "Events & enrollment", icon: "ti-calendar-event" },
      { href: "/admin/reports-settings", label: "Reports & settings", icon: "ti-settings" },
    ],
    examiner: [
      { href: "/examiner/dashboard", label: "Dashboard", icon: "ti-layout-dashboard" },
      { href: "/examiner/exam-workspace", label: "Exam workspace", icon: "ti-file-pencil" },
      { href: "/examiner/grading-results", label: "Grading & results", icon: "ti-certificate" },
      { href: "/examiner/proctoring-stats", label: "Proctoring & stats", icon: "ti-shield-check" },
    ],
    hod: [
      { href: "/hod/dashboard", label: "Dashboard", icon: "ti-layout-dashboard" },
      { href: "/hod/announcement", label: "Announcement", icon: "ti-speakerphone" },
    ],
  };

  const links = linksByRole[role] || [];
  const initial = name ? name.charAt(0) : "U";

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-[#E7E8F0] p-5 flex flex-col justify-between shrink-0">
      <div>
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-accent text-white font-display font-extrabold flex items-center justify-center text-lg">
            U
          </div>
          <span className="font-display font-extrabold text-lg">UniLearn</span>
          <span className="badge badge-accent ml-auto uppercase text-[10px]">{role}</span>
        </div>

        <div className="mb-6 px-3 py-2.5 rounded-xl bg-[#F6F7FB] border border-[#E7E8F0]">
          <div className="flex items-center gap-2.5">
            <div className="avatar w-8 h-8 text-xs">{initial}</div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-ink truncate">{name}</p>
              <p className="text-[11px] text-[#666B80] truncate">{sub}</p>
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
                className={`sidebar-link ${isActive ? "active" : ""}`}
              >
                <i className={`ti ${link.icon} text-lg`}></i>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-[#E7E8F0]">
        <Link href="/login" className="sidebar-link text-[#DC2626] hover:bg-[#FEE2E2]">
          <i className="ti ti-logout text-lg"></i>
          <span>Logout</span>
        </Link>
      </div>
    </aside>
  );
}
