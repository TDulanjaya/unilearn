import { Suspense } from "react";
import StudentNavbar from "@/components/StudentNavbar";
import StudentBottomNav from "@/components/StudentBottomNav";
import AiAssistantLauncher from "@/components/AiAssistantLauncher";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--on-background)] flex flex-col">
      <StudentNavbar />
      <div className="flex-1 pb-16 md:pb-0">{children}</div>
      <StudentBottomNav />
      <Suspense fallback={null}>
        <AiAssistantLauncher />
      </Suspense>
    </div>
  );
}

