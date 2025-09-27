#[cfg(not(target_os = "linux"))]
use tauri_plugin_positioner::{Position, WindowExt};
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial, NSVisualEffectState};

mod watcher;

use log::info;
use tauri::{
    menu::{Menu, MenuEvent, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIcon, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager, WebviewUrl, WebviewWindowBuilder,
};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn close_window(window: tauri::Window) -> Result<(), String> {
    window.close().map_err(|e| e.to_string())
}

#[tauri::command]
async fn minimize_window(window: tauri::Window) -> Result<(), String> {
    window.minimize().map_err(|e| e.to_string())
}

#[tauri::command]
async fn maximize_window(window: tauri::Window) -> Result<(), String> {
    let is_maximized = window.is_maximized().map_err(|e| e.to_string())?;
    if is_maximized {
        window.unmaximize().map_err(|e| e.to_string())
    } else {
        window.maximize().map_err(|e| e.to_string())
    }
}

#[tauri::command]
async fn update_config_address(address: String) -> Result<(), String> {
    let mut config = watcher::config::ConjurerConfig::load()
        .map_err(|e| format!("Failed to load config: {}", e))?;

    config
        .update_address(address)
        .map_err(|e| format!("Failed to update config: {}", e))?;

    info!("Config address updated successfully");
    Ok(())
}

#[tauri::command]
async fn get_config_address() -> Result<String, String> {
    let config = watcher::config::ConjurerConfig::load()
        .map_err(|e| format!("Failed to load config: {}", e))?;

    Ok(config.address)
}

pub fn webview_window_builder(
    app: &AppHandle,
    window_name: &str,
    url: &str,
    width: f64,
    height: f64,
) {
    if let Some(window) = app.get_webview_window(window_name) {
        let _ = window.show();
        let _ = window.set_focus();
        return;
    }

    let window =
        WebviewWindowBuilder::new(app, window_name, WebviewUrl::External(url.parse().unwrap()))
            .title("Conjurer App")
            .inner_size(width, height)
            .transparent(true)
            .decorations(false)
            .build()
            .expect("Failed to create window");

    // Apply vibrancy effect
    #[cfg(target_os = "macos")]
    let _ = apply_vibrancy(
        &window,
        NSVisualEffectMaterial::HudWindow,
        Some(NSVisualEffectState::Active),
        Some(10.0),
    );

    // Position the window
    #[cfg(not(target_os = "linux"))]
    let _ = window.as_ref().window().move_window(Position::TopRight);
}

fn menu_event_handler(_app: &AppHandle, event: MenuEvent) {
    match event.id.as_ref() {
        "info" => {
            // create new window with webview of /info
            webview_window_builder(_app, "info", "http://localhost:1420/info", 800.0, 600.0);
        }
        "quit" => {
            std::process::exit(0);
        }
        _ => {
            println!("Other menu item clicked: {:?}", event);
        }
    }
}

fn tray_icon_event_handler(_tray: &TrayIcon, event: TrayIconEvent) {
    match event {
        TrayIconEvent::Click {
            button: MouseButton::Left,
            button_state: MouseButtonState::Up,
            ..
        } => {
            println!("Tray icon left clicked");
        }
        TrayIconEvent::Click {
            button: MouseButton::Right,
            button_state: MouseButtonState::Up,
            ..
        } => {
            println!("Tray icon right clicked");
        }
        TrayIconEvent::DoubleClick {
            button: MouseButton::Left,
            ..
        } => {
            println!("Tray icon double clicked");
        }
        _ => {
            // println!("Other tray event: {:?}", event);
        }
    }
}

pub fn tray_setup(app: &tauri::App) -> Result<(), Box<(dyn std::error::Error + 'static)>> {
    let info_item = MenuItem::with_id(app, "info", "Info", true, None::<&str>)?;
    let quit_item = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;

    // Create the tray menu
    let menu = Menu::with_items(app, &[&info_item, &quit_item])?;

    // Create the system tray
    TrayIconBuilder::with_id("main-tray")
        .show_menu_on_left_click(true)
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu)
        .on_tray_icon_event(|tray, event| tray_icon_event_handler(tray, event))
        .on_menu_event(|app, event| menu_event_handler(app, event))
        .build(app)?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub async fn run() {
    // Start the daemon in a parallel thread when the app starts
    tokio::spawn(async {
        info!("Starting Conjurer daemon in background...");
        watcher::daemon::run().await;
    });

    let app = tauri::Builder::default()
        .plugin(tauri_plugin_autostart::init(Default::default(), None))
        .plugin(tauri_plugin_positioner::init())
        .setup(|app| tray_setup(app))
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            close_window,
            minimize_window,
            maximize_window,
            update_config_address,
        ])
        .build(tauri::generate_context!())
        .expect("error while running tauri application");

    app.run(|_app, event| match event {
        tauri::RunEvent::ExitRequested { api, .. } => {
            api.prevent_exit();
        }
        _ => {}
    });
}
