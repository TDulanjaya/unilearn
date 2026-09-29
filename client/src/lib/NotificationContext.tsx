"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export interface AppNotification {
  id: number;
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  detail: string;
  time: string;
  read?: boolean;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  addNotification: (n: Omit<AppNotification, "id">) => void;
  markAsRead: (id: number) => Promise<void>;
  refetch: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [localNotifications, setLocalNotifications] = useState<AppNotification[]>([]);

  const { data: notificationsData, isLoading, refetch } = useQuery({
    queryKey: ["notifications", user?.userId],
    queryFn: () => api.get<any>("/api/v1/notifications/me?size=50"),
    enabled: !!user?.userId,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => api.patch(`/api/v1/notifications/${id}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.userId] });
    },
  });

  const rawList = notificationsData?.dataList || notificationsData?.content || [];

  const fetchedNotifications: AppNotification[] = rawList.map((n: any) => ({
    id: n.notificationId,
    title: n.title,
    detail: n.message,
    time: n.createdAt ? new Date(n.createdAt).toLocaleString() : "Just now",
    read: n.read || false,
    icon: "ti-bell",
    iconBg: "bg-[var(--surface-container)]",
    iconColor: "text-[var(--tertiary)]",
  }));

  useEffect(() => {
    setLocalNotifications(fetchedNotifications);
  }, [notificationsData]);

  const addNotification = useCallback((n: Omit<AppNotification, "id">) => {
    setLocalNotifications((prev) => [{ ...n, id: Date.now() }, ...prev]);
  }, []);

  const markAsRead = async (id: number) => {
    setLocalNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
    try {
      await markReadMutation.mutateAsync(id);
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const unreadCount = localNotifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications: localNotifications,
        unreadCount,
        isLoading,
        addNotification,
        markAsRead,
        refetch,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
