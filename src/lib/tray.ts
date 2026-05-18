import { inTauriRuntime } from "@/lib/tauri";

/** Set to false to disable tray setup (e.g. web-only dev). */
export const TRAY_ENABLED = true;

const EVENT_SHOW_MAIN = "tray-show-main";
const EVENT_QUIT = "tray-quit";

const MENU_OPEN_ID = "open";
const MENU_QUIT_ID = "quit";

export async function showMainWindow(): Promise<void> {
  if (!inTauriRuntime()) {
    return;
  }
  const { emit } = await import("@tauri-apps/api/event");
  await emit(EVENT_SHOW_MAIN);
}

export async function quitApp(): Promise<void> {
  if (!inTauriRuntime()) {
    return;
  }
  const { emit } = await import("@tauri-apps/api/event");
  await emit(EVENT_QUIT);
}

async function buildTrayMenu() {
  const { Menu } = await import("@tauri-apps/api/menu");

  return Menu.new({
    items: [
      {
        id: MENU_OPEN_ID,
        text: "Open Link Tray",
        action: () => {
          void showMainWindow();
        },
      },
      {
        id: MENU_QUIT_ID,
        text: "Quit",
        action: () => {
          void quitApp();
        },
      },
    ],
  });
}

function handleTrayAction(
  event: import("@tauri-apps/api/tray").TrayIconEvent,
): void {
  if (event.type !== "Click") {
    return;
  }
  if (event.button !== "Left" || event.buttonState !== "Up") {
    return;
  }
  void showMainWindow();
}

export async function setupTray(): Promise<void> {
  if (!inTauriRuntime() || !TRAY_ENABLED) {
    return;
  }

  const { TrayIcon } = await import("@tauri-apps/api/tray");
  const { defaultWindowIcon } = await import("@tauri-apps/api/app");
  const icon = await defaultWindowIcon();
  const menu = await buildTrayMenu();

  await TrayIcon.new({
    id: "linktray-tray",
    ...(icon ? { icon } : {}),
    tooltip: "Link Tray",
    menu,
    showMenuOnLeftClick: false,
    action: handleTrayAction,
  });
}
