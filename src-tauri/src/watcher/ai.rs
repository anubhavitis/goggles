#![allow(deprecated)]
use log::info;
use reqwest::multipart;
use serde::Deserialize;
use std::{fs::File, path::PathBuf};

#[derive(Debug, Deserialize)]
struct ApiResponse {
    success: bool,
    originalFilename: String,
    generatedFilename: String,
    imageSize: u64,
    mimeType: String,
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
        info!("Sending request to private server for address: {}", address);

        // Create multipart form data
        let form = multipart::Form::new()
            .text("address", address.clone())
            .file("image", &image_path).await?;

        // Send request to your private server
        let response = reqwest::Client::new()
            .post("https://conjurer-production.up.railway.app/generate-filename")
            .multipart(form)
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

        Ok(response_json.generatedFilename)
    }
}
