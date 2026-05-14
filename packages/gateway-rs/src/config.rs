use std::env;

#[derive(Debug, Clone)]
pub struct Config {
    pub port: u16,
    pub database_url: String,
    pub redis_url: String,
    pub network: String,
    pub platform_wallet: String,
    pub admin_secret: String,
    pub gate402_api_url: String,
}

impl Config {
    pub fn from_env() -> Result<Self, String> {
        Ok(Self {
            port: env::var("PORT")
                .unwrap_or_else(|_| "8080".to_string())
                .parse()
                .map_err(|e| format!("Invalid PORT: {}", e))?,
            database_url: env::var("DATABASE_URL")
                .map_err(|_| "DATABASE_URL not set".to_string())?,
            redis_url: env::var("REDIS_URL")
                .unwrap_or_else(|_| "redis://localhost:6379".to_string()),
            network: env::var("SOLANA_NETWORK")
                .unwrap_or_else(|_| "devnet".to_string()),
            platform_wallet: env::var("GATE402_PLATFORM_WALLET")
                .unwrap_or_else(|_| "7UQctUWgfH87jjz9xjnCCKVY6Q1tMWZ8i1ZB3Whx939D".to_string()),
            admin_secret: env::var("ADMIN_SECRET")
                .unwrap_or_else(|_| "gate402-admin-secret-2026".to_string()),
            gate402_api_url: env::var("GATE402_API_URL")
                .unwrap_or_else(|_| "https://api.gate402.dev".to_string()),
        })
    }
}
