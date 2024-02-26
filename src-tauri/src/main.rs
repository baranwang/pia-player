// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use pinyin::ToPinyin;
use tauri::{LogicalSize, Manager, Size};

const ARTICLE_URL_PREFIX: &str = "https://aipiaxi.com/article-detail/";

fn article_webview_navigation_handler(url: &str, article_id: i64, app: tauri::AppHandle) -> bool {
    println!("url: {}", url);
    if url.starts_with(ARTICLE_URL_PREFIX) || url.starts_with("https://aipiaxi.com/Index/post/id/") {
        let url_article_id = url.split('/').last().unwrap().parse::<i64>().unwrap();
        if url_article_id != article_id {
            view_article(url_article_id, app);
            false
        } else {
            true
        }
    } else {
        false
    }
}

#[tauri::command]
fn view_article(article_id: i64, app: tauri::AppHandle) {
    let article_window_id = format!("article-{}", article_id);
    let url = format!("{}{}", ARTICLE_URL_PREFIX, article_id);
    if let Some(window) = app.get_webview_window(&article_window_id) {
        window.set_focus().unwrap();
    } else {
        let app_clone = app.clone();
        let article_window = tauri::WebviewWindowBuilder::new(
            &app,
            article_window_id,
            tauri::WebviewUrl::App(url.into()),
        )
        .initialization_script(include_str!("./preload.js"))
        .on_navigation(move |url| article_webview_navigation_handler(&url.to_string(), article_id, app_clone.clone()))
        .build()
        .unwrap();
        article_window
            .set_size(Size::Logical(LogicalSize::new(960.0, 640.0)))
            .unwrap();
        article_window
            .set_min_size(Some(Size::Logical(LogicalSize::new(960.0, 640.0))))
            .unwrap();
    }
}

#[tauri::command]
fn pinyin(text: &str) -> String {
    let mut result = String::new();
    for ch in text.chars() {
        if let Some(pinyin) = ch.to_pinyin() {
            result.push_str(format!("{} ", pinyin.with_tone()).as_str());
        } else {
            result.push(ch);
        }
    }
    result
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![view_article, pinyin])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
