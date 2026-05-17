use actix_web::{web, HttpRequest, HttpResponse, Responder};
use actix_web::web::Bytes;
use serde_json::json;
use tracing::{info, warn};

use crate::Config;
use crate::db;
use crate::cache;
use crate::payment;
use crate::proxy::ProxyClient;
use sqlx::PgPool;
use redis::Client as RedisClient;

pub async fn health(config: web::Data<Config>) -> impl Responder {
    HttpResponse::Ok().json(json!({
        "status": "ok",
        "service": "gate402-gateway-rs",
        "version": "0.1.0",
        "network": config.network,
        "runtime": "Rust/Actix-Web"
    }))
}

pub async fn gateway(
    req: HttpRequest,
    path: web::Path<(String, String)>,
    body: Bytes,
    config: web::Data<Config>,
    db_pool: web::Data<PgPool>,
    redis: web::Data<RedisClient>,
) -> impl Responder {
    let (_, endpoint_path_raw) = path.into_inner();
    let endpoint_path = format!("/{}", endpoint_path_raw);

    let api_key = match req.headers().get("x-api-key") {
        Some(v) => v.to_str().unwrap_or("").to_string(),
        None => {
            return HttpResponse::Unauthorized().json(json!({
                "error": "Missing x-api-key header"
            }));
        }
    };

    info!("[gateway] {} /gateway/<provider>{}", req.method(), endpoint_path);

    let cache_key = format!("provider:{}:config", api_key);

    let user = match cache::get(&redis, &cache_key).await {
        Some(cached) => serde_json::from_str::<db::User>(&cached).ok(),
        None => {
            let user = db::get_user_by_api_key(&db_pool, &api_key).await;
            if let Some(ref u) = user {
                let serialized = serde_json::to_string(u).unwrap_or_default();
                cache::set(&redis, &cache_key, &serialized, 60).await;
            }
            user
        }
    };

    let user = match user {
        Some(u) => u,
        None => {
            return HttpResponse::Unauthorized().json(json!({
                "error": "Invalid API key",
                "message": "Get your API key at gate402.dev/settings"
            }));
        }
    };

    let endpoints_cache_key = format!("provider:{}:endpoints", user.id);
    let endpoints = match cache::get(&redis, &endpoints_cache_key).await {
        Some(cached) => serde_json::from_str::<Vec<db::Endpoint>>(&cached).unwrap_or_default(),
        None => {
            let eps = db::get_endpoints_for_user(&db_pool, &user.id).await;
            let serialized = serde_json::to_string(&eps).unwrap_or_default();
            cache::set(&redis, &endpoints_cache_key, &serialized, 60).await;
            eps
        }
    };

    info!("[handler] Endpoints loaded: {}", endpoints.len());
    for ep in &endpoints {
        info!("[handler] Endpoint: path={} price={}", ep.path, ep.price_usdc);
    }
    info!("[handler] Looking for path: {}", endpoint_path);

    let endpoint = endpoints.iter().find(|e| e.path == endpoint_path);
    info!("[handler] Endpoint match: {}", endpoint.is_some());

    let endpoint = match endpoint {
        Some(e) => e,
        None => {
            warn!("[handler] No endpoint found for path: {}", endpoint_path);
            let proxy = ProxyClient::new();
            let origin_url = &config.gate402_api_url;
            return match proxy.forward(origin_url, endpoint_path_raw.as_str(), &req, body, None).await {
                Ok(res) => {
                    let status = res.status().as_u16();
                    let resp_body = res.bytes().await.unwrap_or_default();
                    HttpResponse::build(
                        actix_web::http::StatusCode::from_u16(status).unwrap()
                    ).body(resp_body)
                }
                Err(_) => HttpResponse::BadGateway().json(json!({
                    "error": "Upstream unavailable"
                }))
            };
        }
    };

    let price = endpoint.price_usdc;
    let provider_wallet = user.wallet_address.as_deref().unwrap_or("");

    let payment_header = req.headers()
        .get("x-payment-payload")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string());

    match payment_header {
        None => {
            let response_402 = payment::build_402_response(
                price,
                provider_wallet,
                &config.platform_wallet,
                &endpoint_path,
                &config.network,
            );
            HttpResponse::PaymentRequired().json(response_402)
        }

        Some(ref payment) => {
            let idempotency_key = format!("idempotency:payment:{}", payment);
            if cache::exists(&redis, &idempotency_key).await {
                return HttpResponse::PaymentRequired().json(json!({
                    "error": "Payment already used",
                    "details": "This transaction hash has already been used."
                }));
            }

            let tx_parts: Vec<&str> = payment.split(',').collect();
            let tx_provider = tx_parts.first().unwrap_or(&"");

            let is_valid = payment::verify_payment(
                &config.gate402_api_url,
                &api_key,
                tx_provider,
                price * 0.99,
                provider_wallet,
                &config.network,
            ).await;

            if !is_valid {
                return HttpResponse::PaymentRequired().json(json!({
                    "error": "Payment invalid or not confirmed"
                }));
            }

            cache::set(&redis, &idempotency_key, "1", 86400).await;

            info!("[gateway] Payment verified — proxying to provider");

            let proxy = ProxyClient::new();
            match proxy.forward(
                &config.gate402_api_url,
                endpoint_path_raw.as_str(),
                &req,
                body,
                Some(payment),
            ).await {
                Ok(res) => {
                    let status = res.status().as_u16();
                    let resp_body = res.bytes().await.unwrap_or_default();
                    HttpResponse::build(
                        actix_web::http::StatusCode::from_u16(status).unwrap()
                    ).body(resp_body)
                }
                Err(e) => {
                    warn!("[gateway] Proxy error: {}", e);
                    HttpResponse::BadGateway().json(json!({
                        "error": "Upstream request failed",
                        "details": e.to_string()
                    }))
                }
            }
        }
    }
}
