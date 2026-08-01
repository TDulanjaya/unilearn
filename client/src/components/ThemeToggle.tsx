"use client";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle Theme"
      className="p-2 rounded-xl text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-all duration-200 flex items-center justify-center border border-[var(--outline-variant)] hover:border-[var(--outline)] glass hover:scale-105"
    >
      <i className={`ti ${theme === "dark" ? "ti-sun text-amber-400" : "ti-moon text-slate-700"} text-lg`}></i>
    </button>
  );
}
