import { getCurrentWindow } from "@tauri-apps/api/window";
import { inTauriRuntime } from "@/lib/tauri";

export const SPOTLIGHT_OPEN_EVENT = "spotlight:open";

function mainWindow() {
  return getCurrentWindow();
}

export async function isMainWindowVisible(): Promise<boolean> {
  if (!inTauriRuntime()) {
    return true;
  }
  return mainWindow().isVisible();
}

export async function showMainWindow(): Promise<void> {
  if (!inTauriRuntime()) {
    return;
  }
  const win = mainWindow();
  await win.center();
  await win.show();
  await win.unminimize();
  await win.setFocus();
  globalThis.dispatchEvent(new CustomEvent(SPOTLIGHT_OPEN_EVENT));
}

export async function hideMainWindow(): Promise<void> {
  if (!inTauriRuntime()) {
    return;
  }
  await mainWindow().hide();
}

export async function toggleMainWindow(): Promise<void> {
  if (!inTauriRuntime()) {
    return;
  }
  if (await isMainWindowVisible()) {
    await hideMainWindow();
  } else {
    await showMainWindow();
  }
}
