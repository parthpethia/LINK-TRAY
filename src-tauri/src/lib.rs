#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .build(),
        )
        .setup(|_app| {
            // Optional: build the tray from Rust with TrayIconBuilder when preferred.
            // Frontend setup lives in src/lib/tray.ts (see TRAY_ENABLED).
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
