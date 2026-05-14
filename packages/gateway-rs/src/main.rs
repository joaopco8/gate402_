use actix_web::{web, App, HttpServer};
use tracing::info;
use tracing_subscriber::EnvFilter;

mod config;
mod db;
mod cache;
mod payment;
mod proxy;
mod handlers;

pub use config::Config;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv::dotenv().ok();

    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env()
            .add_directive("gate402_gateway=debug".parse().unwrap()))
        .init();

    let config = Config::from_env().expect("Failed to load config");
    let port = config.port;

    info!("Gate402 Gateway starting on port {}", port);
    info!("Network: {}", config.network);

    let db_pool = db::create_pool(&config.database_url)
        .await
        .expect("Failed to connect to database");

    info!("Database connected");

    let redis_client = cache::create_client(&config.redis_url)
        .expect("Failed to create Redis client");

    info!("Redis configured");

    let config = web::Data::new(config);
    let db_pool = web::Data::new(db_pool);
    let redis_client = web::Data::new(redis_client);

    HttpServer::new(move || {
        App::new()
            .app_data(config.clone())
            .app_data(db_pool.clone())
            .app_data(redis_client.clone())
            .route("/health", web::get().to(handlers::health))
            .route("/gateway/{provider_id}/{path:.*}",
                web::route().to(handlers::gateway))
    })
    .bind(format!("0.0.0.0:{}", port))?
    .run()
    .await
}
