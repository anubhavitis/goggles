use std::sync::{
    atomic::{AtomicBool, Ordering},
    mpsc::{channel, RecvTimeoutError},
    Arc,
};

use log::{error, info};
use notify::{Event, EventKind, RecommendedWatcher, RecursiveMode, Watcher};
use tokio::signal;

use crate::watcher::{ai::OpenAI, config, image::SSManager, pid, utils::get_screenshot_dir};

async fn daemon(shutdown: Arc<AtomicBool>) {
    let screenshot_dir = get_screenshot_dir();
    info!("Conjurer is running on {}", screenshot_dir.display());

    let (tx, rx) = channel();

    let mut watcher: RecommendedWatcher =
        Watcher::new(tx, notify::Config::default()).expect("Failed to create watcher");
    watcher
        .watch(&screenshot_dir, RecursiveMode::NonRecursive)
        .expect("Failed to watch directory");

    let config = config::ConjurerConfig::default();
    let ai = OpenAI::new(config.openai_api_key, config.prompt, config.openai_model);
    let ss_controller = SSManager::new(ai);

    info!("Setup complete, Conjurer is ready!");
    while !shutdown.load(Ordering::Relaxed) {
        match rx.recv_timeout(std::time::Duration::from_millis(100)) {
            Ok(event) => {
                if let Ok(Event {
                    kind: EventKind::Create(_),
                    paths,
                    ..
                }) = event
                {
                    for path in paths {
                        info!("Detected new file: {:?}", path);
                        let resp = ss_controller.process_new_ss(&path).await;
                        if let Err(e) = resp {
                            error!("Error processing file: {:?}", e);
                        }
                    }
                }
            }
            Err(RecvTimeoutError::Timeout) => continue,
            Err(e) => error!("Watch error: {:?}", e),
        }
    }

    info!("Shutting down Conjurer thread...");
    watcher.unwatch(&screenshot_dir).ok();
}

pub async fn run() {
    let new_pid = std::process::id();
    info!("Starting Conjurer daemon with PID {}", new_pid);

    // save the pid
    pid::save_pid(new_pid);

    let shutdown = Arc::new(AtomicBool::new(false));
    let shutdown_clone = shutdown.clone();

    let conjurer_thread_handler = tokio::spawn(async move {
        info!("Starting Conjurer thread...");
        daemon(shutdown_clone).await;
    });

    // Wait for shutdown signal
    tokio::select! {
        _ = signal::ctrl_c() => {
            info!("Received shutdown signal. Shutting down...");
            shutdown.store(true, Ordering::Relaxed);
        }
        _ = conjurer_thread_handler => {
            error!("Conjurer thread exited unexpectedly");
        }
    }

    // Give the thread a moment to clean up
    tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;
    info!("Conjurer: Shutting down");
}
