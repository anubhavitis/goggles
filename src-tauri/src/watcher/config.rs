use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GogglesConfig {
    pub updated_at: u64,
    pub address: String,
}

impl GogglesConfig {
    pub fn get_config_address(&self) -> String {
        self.address.clone()
    }

    pub fn get_config_path() -> String {
        if let Some(home_dir) = dirs::home_dir() {
            let config_dir = home_dir.join(".goggles");
            if !config_dir.exists() {
                let _ = fs::create_dir_all(&config_dir);
            }
            config_dir.join("config.json").to_string_lossy().to_string()
        } else {
            "config.json".to_string()
        }
    }

    pub fn load() -> Result<Self, Box<dyn std::error::Error>> {
        let config_path = Self::get_config_path();
        if Path::new(&config_path).exists() {
            let content = fs::read_to_string(&config_path)?;
            let config: GogglesConfig = serde_json::from_str(&content)?;
            Ok(config)
        } else {
            Ok(Self::default())
        }
    }

    pub fn save(&self) -> Result<(), Box<dyn std::error::Error>> {
        let config_path = Self::get_config_path();
        let content = serde_json::to_string_pretty(self)?;
        fs::write(&config_path, content)?;
        Ok(())
    }

    pub fn update_address(
        &mut self,
        new_address: String,
    ) -> Result<(), Box<dyn std::error::Error>> {
        self.address = new_address;
        self.updated_at = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        self.save()?;
        Ok(())
    }
}

impl Default for GogglesConfig {
    fn default() -> Self {
        Self {
            updated_at: SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_secs(),
            address: String::new(),
        }
    }
}
