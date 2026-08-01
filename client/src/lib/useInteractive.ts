"use client";
import { useEffect } from "react";

export function useInteractive() {
  useEffect(() => {
    const handleTabClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const tabBtn = target?.closest("[data-tab]") as HTMLElement | null;
      if (!tabBtn) return;

      const groupName = tabBtn.closest("[data-tabgroup]")?.getAttribute("data-tabgroup");
      const tabTarget = tabBtn.getAttribute("data-tab");
      if (!groupName || !tabTarget) return;

      const tabGroup = tabBtn.closest(`[data-tabgroup="${groupName}"]`);
      if (tabGroup) {
        tabGroup.querySelectorAll("[data-tab]").forEach((btn) => {
          btn.classList.remove("active");
        });
        tabBtn.classList.add("active");
      }

      const container = tabBtn.closest("main") || document.body;
      const panels = container.querySelectorAll(`[data-tabpanel="${groupName}"]`);
      panels.forEach((panel) => {
        const panelEl = panel as HTMLElement;
        if (panelEl.id === `${groupName}-${tabTarget}`) {
          panelEl.classList.remove("hidden");
        } else {
          panelEl.classList.add("hidden");
        }
      });
    };

    const handleModalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const openBtn = target?.closest("[data-modal-open]") as HTMLElement | null;
      if (openBtn) {
        const modalId = openBtn.getAttribute("data-modal-open");
        if (modalId) {
          const modal = document.getElementById(modalId);
          if (modal) modal.classList.remove("hidden");
        }
      }

      const closeBtn = target?.closest("[data-modal-close]") as HTMLElement | null;
      if (closeBtn) {
        const modalId = closeBtn.getAttribute("data-modal-close");
        if (modalId) {
          const modal = document.getElementById(modalId);
          if (modal) modal.classList.add("hidden");
        }
      }
    };

    document.addEventListener("click", handleTabClick);
    document.addEventListener("click", handleModalClick);

    return () => {
      document.removeEventListener("click", handleTabClick);
      document.removeEventListener("click", handleModalClick);
    };
  }, []);
}
