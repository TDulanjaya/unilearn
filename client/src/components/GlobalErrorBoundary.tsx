"use client";
import { useEffect } from "react";

/**
 * Suppress [object Event] runtime errors caused by CDN resource load failures
 * (Google Fonts, Tabler Icons, etc.). These are benign network hiccups that
 * Next.js dev overlay surfaces as unhandled promise rejections.
 *
 * Mount this once in the root layout so every route is covered.
 */
export function GlobalErrorBoundary({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const suppress = (event: PromiseRejectionEvent) => {
      const reason = event?.reason;
      if (
        reason instanceof Event ||
        (reason && typeof reason === "object" && "type" in reason)
      ) {
        event.preventDefault();
      }
    };

    window.addEventListener("unhandledrejection", suppress);
    return () => window.removeEventListener("unhandledrejection", suppress);
  }, []);

  return <>{children}</>;
}
