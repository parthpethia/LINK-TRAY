use tauri::{Listener, Manager};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .build(),
        )
        .setup(|app| {
            let handle = app.handle().clone();

            handle.listen("tray-show-main", {
                let handle = handle.clone();
                move |_event| {
                    if let Some(window) = handle.get_webview_window("main") {
                        let _ = window.center();
                        let _ = window.show();
                        let _ = window.unminimize();
                        let _ = window.set_focus();
                    }
                }
            });

            handle.listen("tray-quit", {
                let handle = handle.clone();
                move |_event| {
                    handle.exit(0);
                }
            });

            if let Some(window) = app.get_webview_window("main") {
                let _ = window.hide();

                window.clone().on_window_event(move |event| {
                    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                        api.prevent_close();
                        let _ = window.hide();
                    }
                });
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
