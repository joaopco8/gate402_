use sqlx::{PgPool, postgres::PgPoolOptions, Row};
use serde::{Deserialize, Serialize};

pub async fn create_pool(database_url: &str) -> Result<PgPool, sqlx::Error> {
    PgPoolOptions::new()
        .max_connections(10)
        .connect(database_url)
        .await
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct User {
    pub id: String,
    pub supabase_id: String,
    pub email: Option<String>,
    pub api_key: String,
    pub wallet_address: Option<String>,
    pub plan: String,
    pub network: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Endpoint {
    pub id: String,
    pub path: String,
    pub price_usdc: f64,
    pub active: bool,
    pub user_id: String,
    pub description: Option<String>,
}

pub async fn get_user_by_api_key(pool: &PgPool, api_key: &str) -> Option<User> {
    let prefix = if api_key.len() >= 8 { &api_key[..8] } else { api_key };
    tracing::debug!("[db] Looking for apiKey prefix: {}...", prefix);

    let result = sqlx::query(
        r#"SELECT id, "supabaseId", email, "apiKey", "walletAddress", plan, network
           FROM "User" WHERE "apiKey" = $1"#,
    )
    .bind(api_key)
    .fetch_optional(pool)
    .await;

    tracing::debug!("[db] Query result ok={}", result.is_ok());

    match result {
        Ok(Some(row)) => {
            tracing::info!("[db] Row found, mapping fields...");
            macro_rules! get_field {
                ($col:expr, $t:ty) => {{
                    match row.try_get::<$t, _>($col) {
                        Ok(v) => v,
                        Err(e) => {
                            tracing::error!("[db] Field '{}' error: {}", $col, e);
                            return None;
                        }
                    }
                }};
            }
            let id: String = get_field!("id", String);
            let supabase_id: String = get_field!("supabaseId", String);
            let email: Option<String> = get_field!("email", Option<String>);
            let api_key: String = get_field!("apiKey", String);
            let wallet_address: Option<String> = get_field!("walletAddress", Option<String>);
            let plan: String = get_field!("plan", String);
            let network: String = get_field!("network", String);
            tracing::info!("[db] User mapped OK — id={} plan={}", id, plan);
            Some(User { id, supabase_id, email, api_key, wallet_address, plan, network })
        }
        Ok(None) => {
            tracing::warn!("[db] No user found for apiKey prefix: {}...", prefix);
            None
        }
        Err(e) => {
            tracing::error!("[db] Query error: {}", e);
            None
        }
    }
}

pub async fn get_endpoints_for_user(pool: &PgPool, user_id: &str) -> Vec<Endpoint> {
    let rows = sqlx::query(
        r#"SELECT id, path, "priceUsdc", active, "userId", description
           FROM "Endpoint" WHERE "userId" = $1 AND active = true"#,
    )
    .bind(user_id)
    .fetch_all(pool)
    .await
    .unwrap_or_default();

    rows.into_iter()
        .filter_map(|row| {
            Some(Endpoint {
                id: row.try_get::<String, _>("id").ok()?,
                path: row.try_get::<String, _>("path").ok()?,
                price_usdc: row.try_get::<f64, _>("priceUsdc").ok()?,
                active: row.try_get::<bool, _>("active").ok()?,
                user_id: row.try_get::<String, _>("userId").ok()?,
                description: row.try_get::<Option<String>, _>("description").ok()?,
            })
        })
        .collect()
}
