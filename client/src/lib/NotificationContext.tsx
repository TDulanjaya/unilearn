"use client";
import React, { createContext, useContext, useState, useCallback } from "react";

export interface AppNotification {
  id: number;
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  detail: string;
  time: string;
}

interface NotificationContextType {
  notifications: AppNotification[];
  addNotification: (n: Omit<AppNotification, "id">) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: 1,
    icon: "ti-file-text",
    iconBg: "bg-[var(--surface-container)]",
    iconColor: "text-[var(--tertiary)]",
    title: "New Assignment Posted: SE308.3",
    detail: "Assignment 2: Test Case Design is due on Dec 18, 2025.",
    time: "10 mins ago",
  },
  {
    id: 2,
    icon: "ti-calendar",
    iconBg: "bg-[var(--warning-container)]",
    iconColor: "text-[var(--on-warning-container)]",
    title: "Exam Scheduled: SE308.3 Software Process Mgmt",
    detail: "Final exam scheduled for Dec 12, 2025 at Main Hall A.",
    time: "2 hours ago",
  },
  {
    id: 3,
    icon: "ti-certificate",
    iconBg: "bg-[var(--secondary-container)]",
    iconColor: "text-[var(--on-secondary-container)]",
    title: "Grade Published: SE202.2 Mid-term Exam",
    detail: "You received 84% (Grade A-) in SE202.2 Database Systems.",
    time: "Yesterday",
  },
];

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(SEED_NOTIFICATIONS);

  const addNotification = useCallback((n: Omit<AppNotification, "id">) => {
    setNotifications((prev) => [{ ...n, id: Date.now() }, ...prev]);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
