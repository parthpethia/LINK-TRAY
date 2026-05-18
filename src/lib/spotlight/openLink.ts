import { inTauriRuntime } from "@/lib/tauri";

export async function openLinkInBrowser(url: string): Promise<void> {
  if (!url.trim()) {
    return;
  }
  if (inTauriRuntime()) {
    const { openUrl } = await import("@tauri-apps/plugin-opener");
    await openUrl(url);
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}
