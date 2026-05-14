use actix_web::HttpRequest;
use reqwest::{Client, Response};
use tracing::info;

pub struct ProxyClient {
    client: Client,
}

impl ProxyClient {
    pub fn new() -> Self {
        Self {
            client: Client::builder()
                .timeout(std::time::Duration::from_secs(30))
                .build()
                .expect("Failed to build HTTP client"),
        }
    }

    pub async fn forward(
        &self,
        origin_url: &str,
        path: &str,
        req: &HttpRequest,
        body: bytes::Bytes,
        payment_header: Option<&str>,
    ) -> Result<Response, reqwest::Error> {
        let target_url = format!("{}/{}", origin_url.trim_end_matches('/'), path);
        info!("[proxy] Forwarding to: {}", target_url);

        let method = reqwest::Method::from_bytes(req.method().as_str().as_bytes())
            .unwrap_or(reqwest::Method::GET);

        let mut request = self.client
            .request(method, &target_url)
            .body(body);

        for (name, value) in req.headers() {
            let name_str = name.as_str().to_lowercase();
            if name_str != "host" && name_str != "x-payment-payload" {
                if let Ok(v) = value.to_str() {
                    request = request.header(name.as_str(), v);
                }
            }
        }

        if let Some(payment) = payment_header {
            request = request.header("X-Payment-Verified", "true");
            request = request.header("X-Payment-Payload", payment);
        }

        request.send().await
    }
}
