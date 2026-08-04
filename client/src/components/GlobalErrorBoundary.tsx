"use client";
import { useEffect } from "react";


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
