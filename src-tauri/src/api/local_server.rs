use crate::db::{normalize_link_input, validate_link_input, Database, Link, LinkInput};
use serde::{Deserialize, Serialize};
use std::io::Read;
use std::sync::Arc;
use std::thread;
use tiny_http::{Header, Method, Request, Response, Server, StatusCode};

/// Fixed localhost port for external save integrations (browser extensions, scripts).
pub const LOCAL_API_PORT: u16 = 38472;

const MAX_BODY_BYTES: usize = 64 * 1024;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SaveLinkBody {
    title: String,
    url: String,
    favicon: Option<String>,
    #[serde(default)]
    tags: Option<Vec<String>>,
    #[serde(default)]
    source: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct ApiSuccess {
    success: bool,
    data: Link,
}

#[derive(Debug, Serialize)]
struct ApiError {
    success: bool,
    error: String,
}

pub fn start_local_api(database: Arc<Database>) {
    thread::spawn(move || {
        if let Err(e) = run_server(database) {
            eprintln!("local API server stopped: {e}");
        }
    });
}

fn run_server(database: Arc<Database>) -> Result<(), String> {
    let addr = format!("127.0.0.1:{LOCAL_API_PORT}");
    let server = Server::http(&addr).map_err(|e| format!("bind {addr}: {e}"))?;
    eprintln!("Link Tray local API listening on http://{addr}");

    for request in server.incoming_requests() {
        let response = handle_request(&database, request);
        if let Err(e) = response {
            eprintln!("local API response error: {e}");
        }
    }
    Ok(())
}

fn handle_request(database: &Arc<Database>, mut request: Request) -> Result<(), String> {
    let peer_ip = match request.remote_addr() {
        Some(addr) => addr.ip(),
        None => {
            return write_json(
                request,
                StatusCode(403),
                &ApiError {
                    success: false,
                    error: "forbidden: could not verify client address".into(),
                },
            );
        }
    };
    if !is_local_peer(peer_ip) {
        return write_json(
            request,
            StatusCode(403),
            &ApiError {
                success: false,
                error: "forbidden: only localhost connections are allowed".into(),
            },
        );
    }

    if request.method() == &Method::Options {
        return write_options(request);
    }

    if request.method() != &Method::Post || request.url() != "/save-link" {
        return write_json(
            request,
            StatusCode(404),
            &ApiError {
                success: false,
                error: "not found".into(),
            },
        );
    }

    let content_type = request
        .headers()
        .iter()
        .find(|h| h.field.equiv("Content-Type"))
        .map(|h| h.value.as_str().to_ascii_lowercase())
        .unwrap_or_default();

    if !content_type.starts_with("application/json") {
        return write_json(
            request,
            StatusCode(415),
            &ApiError {
                success: false,
                error: "Content-Type must be application/json".into(),
            },
        );
    }

    let mut body = Vec::new();
    request
        .as_reader()
        .take(MAX_BODY_BYTES as u64 + 1)
        .read_to_end(&mut body)
        .map_err(|e| e.to_string())?;

    if body.len() > MAX_BODY_BYTES {
        return write_json(
            request,
            StatusCode(413),
            &ApiError {
                success: false,
                error: "request body too large".into(),
            },
        );
    }

    let parsed: SaveLinkBody = match serde_json::from_slice(&body) {
        Ok(v) => v,
        Err(e) => {
            return write_json(
                request,
                StatusCode(400),
                &ApiError {
                    success: false,
                    error: format!("invalid JSON: {e}"),
                },
            );
        }
    };

    let input = LinkInput {
        id: None,
        title: parsed.title,
        url: parsed.url,
        favicon: parsed.favicon,
        tags: parsed.tags,
        source: parsed.source,
    };

    let mut input = normalize_link_input(input);
    input.id = None;

    if let Err(message) = validate_link_input(&input) {
        return write_json(
            request,
            StatusCode(400),
            &ApiError {
                success: false,
                error: message,
            },
        );
    }

    match database.save_link(input) {
        Ok(link) => write_json(
            request,
            StatusCode(200),
            &ApiSuccess {
                success: true,
                data: link,
            },
        ),
        Err(message) => write_json(
            request,
            StatusCode(500),
            &ApiError {
                success: false,
                error: message,
            },
        ),
    }
}

fn is_local_peer(ip: std::net::IpAddr) -> bool {
    match ip {
        std::net::IpAddr::V4(v4) => v4.is_loopback(),
        std::net::IpAddr::V6(v6) => v6.is_loopback(),
    }
}

fn write_options(request: Request) -> Result<(), String> {
    let response = Response::empty(StatusCode(204))
        .with_header(Header::from_bytes(&b"Allow"[..], b"POST, OPTIONS").unwrap())
        .with_header(Header::from_bytes(&b"Access-Control-Allow-Methods"[..], b"POST, OPTIONS").unwrap())
        .with_header(Header::from_bytes(&b"Access-Control-Allow-Headers"[..], b"Content-Type").unwrap());
    request.respond(response).map_err(|e| e.to_string())
}

fn write_json<T: Serialize>(request: Request, status: StatusCode, payload: &T) -> Result<(), String> {
    let body = serde_json::to_vec(payload).map_err(|e| e.to_string())?;
    let response = Response::from_data(body)
        .with_status_code(status)
        .with_header(Header::from_bytes(&b"Content-Type"[..], b"application/json").unwrap());
    request.respond(response).map_err(|e| e.to_string())
}
