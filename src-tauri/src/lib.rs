#[cfg(not(target_os = "linux"))]
use tauri_plugin_positioner::{Position, WindowExt};

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
            .build()
            .expect("Failed to create window");

    // Position the window
    #[cfg(not(target_os = "linux"))]
    let _ = window.as_ref().window().move_window(Position::TopRight);
}

fn menu_event_handler(_app: &AppHandle, event: MenuEvent) {
    match event.id.as_ref() {
        "test" => {
            // create new window with webview of /test
            webview_window_builder(_app, "test", "http://localhost:1420/test", 800.0, 600.0);
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
    let test_item = MenuItem::with_id(app, "test", "Test", true, None::<&str>)?;
    let quit_item = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;

    // Create the tray menu
    let menu = Menu::with_items(app, &[&test_item, &quit_item])?;

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
pub fn run() {
    let app = tauri::Builder::default()
        .plugin(tauri_plugin_autostart::init(Default::default(), None))
        .plugin(tauri_plugin_positioner::init())
        .setup(|app| tray_setup(app))
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .build(tauri::generate_context!())
        .expect("error while running tauri application");

    app.run(|_app, event| match event {
        tauri::RunEvent::ExitRequested { api, .. } => {
            api.prevent_exit();
        }
        _ => {}
    });
}
