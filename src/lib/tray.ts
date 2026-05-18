import { inTauriRuntime } from "@/lib/tauri";

/**
 * Flip to `true` when tray icon, menu, and handlers are ready.
 * @see https://v2.tauri.app/learn/system-tray/
 */
export const TRAY_ENABLED = false;

export async function setupTray(): Promise<void> {
  if (!inTauriRuntime() || !TRAY_ENABLED) {
    return;
  }

  const { TrayIcon } = await import("@tauri-apps/api/tray");
  const { defaultWindowIcon } = await import("@tauri-apps/api/app");
  const icon = await defaultWindowIcon();

  await TrayIcon.new({
    ...(icon ? { icon } : {}),
    tooltip: "Link Tray",
    // menu: await buildTrayMenu(),
    // action: (event) => { /* handle tray clicks */ },
  });
}
