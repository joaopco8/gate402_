use sqlx::{PgPool, postgres::PgPoolOptions, Row};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

pub async fn create_pool(database_url: &str) -> Result<PgPool, sqlx::Error> {
    PgPoolOptions::new()
        .max_connections(10)
        .connect(database_url)
        .await
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct User {
    pub id: Uuid,
    pub supabase_id: String,
    pub email: Option<String>,
    pub api_key: String,
    pub wallet_address: Option<String>,
    pub plan: String,
    pub network: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Endpoint {
    pub id: Uuid,
    pub path: String,
    pub price_usdc: f64,
    pub active: bool,
    pub user_id: Uuid,
    pub description: Option<String>,
}

pub async fn get_user_by_api_key(pool: &PgPool, api_key: &str) -> Option<User> {
    let row = sqlx::query(
        r#"SELECT id, "supabaseId", email, "apiKey", "walletAddress", plan, network
           FROM "User" WHERE "apiKey" = $1"#,
    )
    .bind(api_key)
    .fetch_optional(pool)
    .await
    .ok()
    .flatten()?;

    Some(User {
        id: row.try_get("id").ok()?,
        supabase_id: row.try_get("supabaseId").ok()?,
        email: row.try_get("email").ok()?,
        api_key: row.try_get("apiKey").ok()?,
        wallet_address: row.try_get("walletAddress").ok()?,
        plan: row.try_get("plan").ok()?,
        network: row.try_get("network").ok()?,
    })
}

pub async fn get_endpoints_for_user(pool: &PgPool, user_id: Uuid) -> Vec<Endpoint> {
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
                id: row.try_get("id").ok()?,
                path: row.try_get("path").ok()?,
                price_usdc: row.try_get::<f64, _>("priceUsdc").ok()?,
                active: row.try_get("active").ok()?,
                user_id: row.try_get("userId").ok()?,
                description: row.try_get("description").ok()?,
            })
        })
        .collect()
}
