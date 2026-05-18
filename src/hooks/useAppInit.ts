import { useEffect } from "react";
import { setupGlobalShortcuts } from "@/lib/shortcuts";
import { setupTray } from "@/lib/tray";

export function useAppInit(): void {
  useEffect(() => {
    void (async () => {
      await setupTray();
      await setupGlobalShortcuts();
    })();
  }, []);
}
