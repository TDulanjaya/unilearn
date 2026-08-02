import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";

export const metadata: Metadata = {
  title: "UniLearn — Next-Gen University LMS",
  description: "Modern higher education platform with AI study assistance, proctored exams, automated grading, and real-time course analytics.",
  keywords: ["LMS", "University", "Education", "Software Engineering", "AI Assistant", "Grading"],
  authors: [{ name: "UniLearn" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f8fc" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1c2e" },
  ],
};

import { NotificationProvider } from "@/lib/NotificationContext";
import { AcademicDataProvider } from "@/context/AcademicDataContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css"
        />
      </head>
      <body className="bg-[var(--background)] text-[var(--on-background)] min-h-screen font-sans antialiased">
        <ThemeProvider>
          <GlobalErrorBoundary>
            <NotificationProvider>
              <AcademicDataProvider>{children}</AcademicDataProvider>
            </NotificationProvider>
          </GlobalErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
