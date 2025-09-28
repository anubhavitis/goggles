use std::path::PathBuf;

fn get_pid_path() -> PathBuf {
    let parent_path = dirs::config_dir().unwrap().join("conjurer");
    if !parent_path.exists() {
        std::fs::create_dir_all(parent_path.clone()).unwrap();
    }
    parent_path.join("conjurer.pid")
}

pub fn save_pid(pid: u32) {
    let pid_path = get_pid_path();
    std::fs::write(pid_path, pid.to_string()).unwrap();
}
