// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tokio::main]
async fn main() {
    // Initialize the logger to display info! logs on terminal
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();

    goggles_lib::run().await;
}
