// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::collections::HashMap;
use std::thread;
use tauri::{AppHandle};
use tauri::Emitter;
use tungstenite::{Message};
use url::Url;
use native_tls::TlsConnector;
use base64;
use tungstenite::client::IntoClientRequest;
use tungstenite::http::header::{HeaderName, HeaderValue};
use once_cell::sync::Lazy;
use std::sync::atomic::{AtomicBool, Ordering};

// Global flag to track if a WebSocket connection is active
static WS_ACTIVE: Lazy<AtomicBool> = Lazy::new(|| AtomicBool::new(false));

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_exe_dir() -> String {
    std::env::current_exe()
        .ok()
        .and_then(|path| path.parent().map(|p| p.to_string_lossy().to_string()))
        .unwrap_or_default()
}

#[tauri::command]
fn start_ws(
    app: AppHandle,
    ws_url: String,
    headers: Option<HashMap<String, String>>,
) -> Result<(), String> {
    // Check if a connection is already active
    if WS_ACTIVE.swap(true, Ordering::SeqCst) {
        // Already connected, ignore this call
        return Ok(());
    }
    thread::spawn(move || {
        let url = match Url::parse(&ws_url) {
            Ok(u) => u,
            Err(e) => {
                app.emit("ws_error", format!("Invalid URL: {}", e)).ok();
                WS_ACTIVE.store(false, Ordering::SeqCst);
                return;
            }
        };
        let mut req = match ws_url.clone().into_client_request() {
            Ok(r) => r,
            Err(e) => {
                println!("[tauri-backend] Invalid request: {}", e);
                app.emit("ws_error", format!("Invalid request: {}", e)).ok();
                WS_ACTIVE.store(false, Ordering::SeqCst);
                return;
            }
        };
        if let Some(hdrs) = &headers {
            for (k, v) in hdrs {
                req.headers_mut().insert(
                    HeaderName::from_bytes(k.as_bytes()).unwrap(),
                    HeaderValue::from_str(v).unwrap(),
                );
            }
        }
        // Disable SSL verification
        let tls = TlsConnector::builder().danger_accept_invalid_certs(true).build().unwrap();
        let domain = url.host_str().unwrap_or("");
        let stream = std::net::TcpStream::connect((domain, url.port_or_known_default().unwrap_or(443)));
        let stream = match stream {
            Ok(s) => s,
            Err(e) => {
                println!("[tauri-backend] TCP connect error: {}", e);
                app.emit("ws_error", format!("TCP connect error: {}", e)).ok();
                WS_ACTIVE.store(false, Ordering::SeqCst);
                return;
            }
        };
        let tls_stream = match tls.connect(domain, stream) {
            Ok(s) => s,
            Err(e) => {
                println!("[tauri-backend] TLS error: {}", e);
                app.emit("ws_error", format!("TLS error: {}", e)).ok();
                WS_ACTIVE.store(false, Ordering::SeqCst);
                return;
            }
        };
        let (mut socket, _resp) = match tungstenite::client::client(req, tls_stream) {
            Ok(s) => {
                println!("[tauri-backend] WebSocket connected");
                s
            },
            Err(e) => {
                println!("[tauri-backend] WebSocket handshake error: {}", e);
                app.emit("ws_error", format!("WebSocket handshake error: {}", e)).ok();
                WS_ACTIVE.store(false, Ordering::SeqCst);
                return;
            }
        };
        // Send initial message after connecting
        let initial_msg = serde_json::json!([5, "OnJsonApiEvent_chat_v4_presences"]).to_string();
        if let Err(e) = socket.send(Message::Text(initial_msg)) {
            app.emit("ws_error", format!("Failed to send initial message: {}", e)).ok();
            WS_ACTIVE.store(false, Ordering::SeqCst);
            return;
        }
        while let Ok(msg) = socket.read() {
            if let Message::Text(txt) = msg {
                app.emit("ws_message", txt).ok();
            } else if let Message::Binary(bin) = msg {
                app.emit("ws_message", base64::encode(bin)).ok();
            }
        }
        // Reset the flag when the connection ends
        WS_ACTIVE.store(false, Ordering::SeqCst);
    });
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_websocket::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, get_exe_dir, start_ws])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
