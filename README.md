# Link Tray

A minimal Tauri v2 desktop app built with React, TypeScript, Vite, and Tailwind CSS.

## Prerequisites (Windows)

1. [Node.js](https://nodejs.org/) (LTS, v20+ recommended)
2. [Rust](https://www.rust-lang.org/tools/install) via `rustup`
3. [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) (Desktop development with C++)
4. [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) (usually preinstalled on Windows 11)

See the [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/) guide for details.

## Setup

```powershell
cd D:\Projects\LINKTRAY
npm install
```

## Development

Run the app in development mode (Vite + Tauri):

```powershell
npm run tauri dev
```

## Production build

```powershell
npm run tauri build
```

Installers and binaries are written to `src-tauri/target/release/bundle/`.

## Project structure

```
src/
  app/           # Root React component
  components/    # UI components (Home screen)
  hooks/         # App lifecycle hooks
  lib/           # Tray, shortcuts, Tauri helpers
src-tauri/       # Rust backend and Tauri config
```

## System tray

Tray support is wired but disabled by default.

1. Set `TRAY_ENABLED` to `true` in `src/lib/tray.ts`
2. Customize the tray icon, menu, and handlers
3. See [Tauri system tray docs](https://v2.tauri.app/learn/system-tray/)

The Rust crate already enables the `tray-icon` feature.

## Global shortcuts

Global shortcuts are wired but disabled by default.

1. Add entries to `SHORTCUTS` in `src/lib/shortcuts.ts`
2. Set `GLOBAL_SHORTCUTS_ENABLED` to `true`
3. See [global shortcut plugin docs](https://v2.tauri.app/plugin/global-shortcut/)

Capabilities in `src-tauri/capabilities/default.json` already include the required permissions.

## Tech stack

- [Tauri v2](https://v2.tauri.app/)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
