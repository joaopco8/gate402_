use serde::{Deserialize, Serialize};
use tracing::{info, warn, error};

#[derive(Debug, Serialize, Deserialize)]
pub struct PaymentSplits {
    pub provider: SplitEntry,
    pub platform: SplitEntry,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SplitEntry {
    pub wallet: String,
    pub amount: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PaymentRequired402 {
    pub error: String,
    pub price: PriceInfo,
    pub splits: PaymentSplits,
    pub endpoint: String,
    pub instructions: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PriceInfo {
    pub total: f64,
    pub currency: String,
    pub network: String,
}

pub fn build_402_response(
    price: f64,
    provider_wallet: &str,
    platform_wallet: &str,
    endpoint: &str,
    network: &str,
) -> PaymentRequired402 {
    let platform_fee = (price * 0.01 * 1_000_000.0).round() / 1_000_000.0;
    let provider_amount = (price * 0.99 * 1_000_000.0).round() / 1_000_000.0;

    PaymentRequired402 {
        error: "Payment Required".to_string(),
        price: PriceInfo {
            total: price,
            currency: "USDC".to_string(),
            network: format!("solana-{}", network),
        },
        splits: PaymentSplits {
            provider: SplitEntry {
                wallet: provider_wallet.to_string(),
                amount: provider_amount,
            },
            platform: SplitEntry {
                wallet: platform_wallet.to_string(),
                amount: platform_fee,
            },
        },
        endpoint: endpoint.to_string(),
        instructions: format!(
            "Send USDC on Solana {} and include tx hash in X-Payment-Payload header",
            network
        ),
    }
}

pub async fn verify_payment(
    gate402_api_url: &str,
    api_key: &str,
    tx_hash: &str,
    expected_amount: f64,
    expected_wallet: &str,
    network: &str,
) -> bool {
    if tx_hash.starts_with("demo_") {
        info!("[payment] Demo mode — bypassing verification for {}", tx_hash);
        return true;
    }

    let client = reqwest::Client::new();
    let payload = serde_json::json!({
        "txHash": tx_hash,
        "expectedAmount": expected_amount,
        "expectedWallet": expected_wallet,
        "network": network,
    });

    match client
        .post(format!("{}/api/verify-payment", gate402_api_url))
        .header("Content-Type", "application/json")
        .header("x-api-key", api_key)
        .json(&payload)
        .timeout(std::time::Duration::from_secs(15))
        .send()
        .await
    {
        Ok(res) => {
            match res.json::<serde_json::Value>().await {
                Ok(data) => {
                    let valid = data["valid"].as_bool().unwrap_or(false);
                    if valid {
                        info!("[payment] Verified on-chain: {}", tx_hash);
                    } else {
                        warn!("[payment] Invalid payment: {}", tx_hash);
                    }
                    valid
                }
                Err(e) => {
                    error!("[payment] Failed to parse verification response: {}", e);
                    false
                }
            }
        }
        Err(e) => {
            error!("[payment] Verification request failed: {}", e);
            false
        }
    }
}
