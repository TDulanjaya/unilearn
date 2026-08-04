import { Suspense } from "react";
import StudentNavbar from "@/components/StudentNavbar";
import AiAssistantLauncher from "@/components/AiAssistantLauncher";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--on-background)] flex flex-col">
      <StudentNavbar />
      <div className="flex-1">{children}</div>
      <Suspense fallback={null}>
        <AiAssistantLauncher />
      </Suspense>
    </div>
  );
}

