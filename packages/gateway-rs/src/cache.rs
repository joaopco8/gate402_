use redis::{Client, AsyncCommands, RedisResult};

pub fn create_client(redis_url: &str) -> RedisResult<Client> {
    Client::open(redis_url)
}

pub async fn get(client: &Client, key: &str) -> Option<String> {
    let mut conn = client.get_multiplexed_async_connection().await.ok()?;
    conn.get(key).await.ok()
}

pub async fn set(client: &Client, key: &str, value: &str, ttl_secs: u64) -> bool {
    let mut conn = match client.get_multiplexed_async_connection().await {
        Ok(c) => c,
        Err(_) => return false,
    };
    conn.set_ex::<_, _, ()>(key, value, ttl_secs).await.is_ok()
}

pub async fn exists(client: &Client, key: &str) -> bool {
    let mut conn = match client.get_multiplexed_async_connection().await {
        Ok(c) => c,
        Err(_) => return false,
    };
    conn.exists::<_, bool>(key).await.unwrap_or(false)
}
