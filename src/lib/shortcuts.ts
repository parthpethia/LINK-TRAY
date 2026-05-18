import { toggleMainWindow } from "@/lib/mainWindow";
import { inTauriRuntime } from "@/lib/tauri";

/**
 * Flip to `true` when global shortcuts are defined.
 * @see https://v2.tauri.app/plugin/global-shortcut/
 */
export const GLOBAL_SHORTCUTS_ENABLED = true;

export type ShortcutDefinition = {
  accelerator: string;
  onTrigger: () => void;
};

/** Register shortcuts here, then set GLOBAL_SHORTCUTS_ENABLED to true. */
export const SHORTCUTS: ShortcutDefinition[] = [
  {
    accelerator: "Alt+Space",
    onTrigger: () => {
      void toggleMainWindow();
    },
  },
];

export async function setupGlobalShortcuts(): Promise<void> {
  if (!inTauriRuntime() || !GLOBAL_SHORTCUTS_ENABLED) {
    return;
  }

  if (SHORTCUTS.length === 0) {
    return;
  }

  const { register } = await import("@tauri-apps/plugin-global-shortcut");

  for (const { accelerator, onTrigger } of SHORTCUTS) {
    await register(accelerator, (event) => {
      if (event.state === "Pressed") {
        onTrigger();
      }
    });
  }
}
