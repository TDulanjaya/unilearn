"use client";
import StudentNavbar from "@/components/StudentNavbar";
import { useNotifications } from "@/lib/NotificationContext";

export default function NotificationsPage() {
  const { notifications } = useNotifications();

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--on-background)]">
      <StudentNavbar />
      <main className="max-w-[1000px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
            Notifications
          </h1>
          <p className="text-[var(--on-surface-variant)] text-sm">
            Course updates, exam schedules, and system alerts.
          </p>
        </div>

        <div className="card divide-y divide-[var(--outline-variant)] shadow-md overflow-hidden">
          {notifications.length === 0 ? (
            <p className="p-6 text-sm text-[var(--on-surface-variant)] text-center">No notifications found.</p>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="p-4 sm:p-5 flex items-start gap-4 hover:bg-[var(--surface-container-low)] transition-colors">
                <div className={`w-10 h-10 rounded-2xl ${n.iconBg} ${n.iconColor} flex items-center justify-center shrink-0 mt-0.5 font-bold`}>
                  <i className={`ti ${n.icon} text-xl`}></i>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[var(--on-surface)]">{n.title}</p>
                  <p className="text-xs text-[var(--on-surface-variant)] mt-1">{n.detail}</p>
                  <span className="text-[11px] text-[var(--outline)] mt-1.5 font-medium block">{n.time}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
