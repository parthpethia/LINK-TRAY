import { isTauri } from "@tauri-apps/api/core";

export function inTauriRuntime(): boolean {
  return isTauri();
}
