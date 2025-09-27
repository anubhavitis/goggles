#![allow(deprecated)]
use log::info;
use reqwest::header::CONTENT_TYPE;
use serde::Deserialize;
use serde_json::json;
use std::{fs::File, io::Read, path::PathBuf};

#[derive(Debug, Deserialize)]
struct ApiResponse {
    name: String,
    address: String,
}

#[derive(Debug, Clone)]
pub struct OpenAI {}

impl OpenAI {
    pub fn new() -> Self {
        Self {}
    }

    pub async fn get_name(
        &self,
        address: String,
        image_path: PathBuf,
    ) -> Result<String, anyhow::Error> {
        // Read the image file
        let mut image_file = File::open(&image_path)?;
        let mut image_buffer = Vec::new();
        image_file.read_to_end(&mut image_buffer)?;

        // Encode image as base64 for JSON transmission
        let image_base64 = base64::encode(&image_buffer);

        info!("Sending request to private server for address: {}", address);

        // Send request to your private server
        let response = reqwest::Client::new()
            .post("https://your-private-server.com/api/analyze") // Replace with your actual server URL
            .header(CONTENT_TYPE, "application/json")
            .body(
                json!({
                    "userAddress": address,
                    "image": image_base64
                })
                .to_string(),
            )
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(anyhow::anyhow!(
                "Server returned error status: {}",
                response.status()
            ));
        }

        // Parse the response in ApiResponse struct
        let response_text = response.text().await?;
        let response_json: ApiResponse = serde_json::from_str(&response_text)?;
        info!("Received response from server: {:?}", response_json);

        Ok(response_json.name)
    }
}
