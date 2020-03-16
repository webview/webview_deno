#[macro_use]
extern crate deno_core;
extern crate serde;
extern crate serde_json;
extern crate webview_sys;

use deno_core::{CoreOp, Op, PluginInitContext, ZeroCopyBuf};
use serde::{Deserialize, Serialize};
use std::{cell::RefCell, collections::HashMap, ffi::CString, ptr::null_mut};
use webview_sys::*;

thread_local! {
    static INSTANCE_INDEX: RefCell<u32> = RefCell::new(0);
    static INSTANCE_MAP: RefCell<HashMap<u32, *mut CWebView>> = RefCell::new(HashMap::new());
}

fn init(context: &mut dyn PluginInitContext) {
    context.register_op("webview_new", Box::new(op_webview_new));
    context.register_op("webview_exit", Box::new(op_webview_exit));
    context.register_op("webview_eval", Box::new(op_webview_eval));
    context.register_op("webview_set_color", Box::new(op_webview_set_color));
    context.register_op("webview_set_title", Box::new(op_webview_set_title));
    context.register_op(
        "webview_set_fullscreen",
        Box::new(op_webview_set_fullscreen),
    );
    context.register_op("webview_loop", Box::new(op_webview_loop));
}
init_fn!(init);

#[derive(Serialize)]
struct WebViewResponse<T> {
    err: Option<String>,
    ok: Option<T>,
}

#[derive(Deserialize)]
struct WebViewNewParams {
    title: String,
    url: String,
    width: i32,
    height: i32,
    resizable: bool,
    debug: bool,
    frameless: bool,
}

#[derive(Serialize)]
struct WebViewNewResult {
    id: u32,
}

fn op_webview_new(data: &[u8], _zero_copy: Option<ZeroCopyBuf>) -> CoreOp {
    unsafe {
        let mut response: WebViewResponse<WebViewNewResult> = WebViewResponse {
            err: None,
            ok: None,
        };

        let params: WebViewNewParams = serde_json::from_slice(data).unwrap();

        let mut instance_id: u32 = 0;
        INSTANCE_INDEX.with(|cell| {
            instance_id = cell.replace_with(|&mut i| i + 1);
        });

        INSTANCE_MAP.with(|cell| {
            cell.borrow_mut().insert(
                instance_id,
                webview_new(
                    CString::new(params.title).unwrap().as_ptr(),
                    CString::new(params.url).unwrap().as_ptr(),
                    params.width,
                    params.height,
                    params.resizable as i32,
                    params.debug as i32,
                    params.frameless as i32,
                    None,
                    null_mut(),
                ),
            );
        });

        response.ok = Some(WebViewNewResult { id: instance_id });

        Op::Sync(serde_json::to_vec(&response).unwrap().into_boxed_slice())
    }
}

#[derive(Deserialize)]
struct WebViewExitParams {
    id: u32,
}

#[derive(Serialize)]
struct WebViewExitResult {}

fn op_webview_exit(data: &[u8], _zero_copy: Option<ZeroCopyBuf>) -> CoreOp {
    unsafe {
        let mut response: WebViewResponse<WebViewExitResult> = WebViewResponse {
            err: None,
            ok: None,
        };

        let params: WebViewExitParams = serde_json::from_slice(data).unwrap();

        INSTANCE_MAP.with(|cell| {
            let instance_map = cell.borrow_mut();

            if !instance_map.contains_key(&params.id) {
                response.err = Some(format!("Could not find instance of id {}", &params.id))
            } else {
                let instance: *mut CWebView = *instance_map.get(&params.id).unwrap();

                webview_exit(instance);

                response.ok = Some(WebViewExitResult {});
            }
        });

        Op::Sync(serde_json::to_vec(&response).unwrap().into_boxed_slice())
    }
}

#[derive(Deserialize)]
struct WebViewEvalParams {
    id: u32,
    js: String,
}

#[derive(Serialize)]
struct WebViewEvalResult {}

fn op_webview_eval(data: &[u8], _zero_copy: Option<ZeroCopyBuf>) -> CoreOp {
    unsafe {
        let mut response: WebViewResponse<WebViewEvalResult> = WebViewResponse {
            err: None,
            ok: None,
        };

        let params: WebViewEvalParams = serde_json::from_slice(data).unwrap();

        INSTANCE_MAP.with(|cell| {
            let instance_map = cell.borrow_mut();

            if !instance_map.contains_key(&params.id) {
                response.err = Some(format!("Could not find instance of id {}", &params.id))
            } else {
                let instance: *mut CWebView = *instance_map.get(&params.id).unwrap();

                match webview_eval(instance, CString::new(params.js).unwrap().as_ptr()) {
                    0 => {
                        response.ok = Some(WebViewEvalResult {});
                    }
                    _ => response.err = Some("Could not evaluate javascript".to_string()),
                }
            }
        });

        Op::Sync(serde_json::to_vec(&response).unwrap().into_boxed_slice())
    }
}

#[derive(Deserialize)]
struct WebViewSetColorParams {
    id: u32,
    r: u8,
    g: u8,
    b: u8,
    a: u8,
}

#[derive(Serialize)]
struct WebViewSetColorResult {}

fn op_webview_set_color(data: &[u8], _zero_copy: Option<ZeroCopyBuf>) -> CoreOp {
    unsafe {
        let mut response: WebViewResponse<WebViewSetColorResult> = WebViewResponse {
            err: None,
            ok: None,
        };

        let params: WebViewSetColorParams = serde_json::from_slice(data).unwrap();

        INSTANCE_MAP.with(|cell| {
            let instance_map = cell.borrow_mut();

            if !instance_map.contains_key(&params.id) {
                response.err = Some(format!("Could not find instance of id {}", &params.id))
            } else {
                let instance: *mut CWebView = *instance_map.get(&params.id).unwrap();

                webview_set_color(instance, params.r, params.g, params.b, params.a);

                response.ok = Some(WebViewSetColorResult {});
            }
        });

        Op::Sync(serde_json::to_vec(&response).unwrap().into_boxed_slice())
    }
}

#[derive(Deserialize)]
struct WebViewSetTitleParams {
    id: u32,
    title: String,
}

#[derive(Serialize)]
struct WebViewSetTitleResult {}

fn op_webview_set_title(data: &[u8], _zero_copy: Option<ZeroCopyBuf>) -> CoreOp {
    unsafe {
        let mut response: WebViewResponse<WebViewSetTitleResult> = WebViewResponse {
            err: None,
            ok: None,
        };

        let params: WebViewSetTitleParams = serde_json::from_slice(data).unwrap();

        INSTANCE_MAP.with(|cell| {
            let instance_map = cell.borrow_mut();

            if !instance_map.contains_key(&params.id) {
                response.err = Some(format!("Could not find instance of id {}", &params.id))
            } else {
                let instance: *mut CWebView = *instance_map.get(&params.id).unwrap();

                webview_set_title(instance, CString::new(params.title).unwrap().as_ptr());

                response.ok = Some(WebViewSetTitleResult {});
            }
        });

        Op::Sync(serde_json::to_vec(&response).unwrap().into_boxed_slice())
    }
}

#[derive(Deserialize)]
struct WebViewSetFullscreenParams {
    id: u32,
    fullscreen: bool,
}

#[derive(Serialize)]
struct WebViewSetFullscreenResult {}

fn op_webview_set_fullscreen(data: &[u8], _zero_copy: Option<ZeroCopyBuf>) -> CoreOp {
    unsafe {
        let mut response: WebViewResponse<WebViewSetFullscreenResult> = WebViewResponse {
            err: None,
            ok: None,
        };

        let params: WebViewSetFullscreenParams = serde_json::from_slice(data).unwrap();

        INSTANCE_MAP.with(|cell| {
            let instance_map = cell.borrow_mut();

            if !instance_map.contains_key(&params.id) {
                response.err = Some(format!("Could not find instance of id {}", &params.id))
            } else {
                let instance: *mut CWebView = *instance_map.get(&params.id).unwrap();

                webview_set_fullscreen(instance, params.fullscreen as i32);

                response.ok = Some(WebViewSetFullscreenResult {});
            }
        });

        Op::Sync(serde_json::to_vec(&response).unwrap().into_boxed_slice())
    }
}

#[derive(Deserialize)]
struct WebViewLoopParams {
    id: u32,
    blocking: i32,
}

#[derive(Serialize)]
struct WebViewLoopResult {
    code: i32,
}

fn op_webview_loop(data: &[u8], _zero_copy: Option<ZeroCopyBuf>) -> CoreOp {
    unsafe {
        let mut response: WebViewResponse<WebViewLoopResult> = WebViewResponse {
            err: None,
            ok: None,
        };

        let params: WebViewLoopParams = serde_json::from_slice(data).unwrap();

        INSTANCE_MAP.with(|cell| {
            let instance_map = cell.borrow_mut();

            if !instance_map.contains_key(&params.id) {
                response.err = Some(format!("Could not find instance of id {}", &params.id))
            } else {
                let instance: *mut CWebView = *instance_map.get(&params.id).unwrap();

                response.ok = Some(WebViewLoopResult {
                    code: webview_loop(instance, params.blocking),
                });
            }
        });

        Op::Sync(serde_json::to_vec(&response).unwrap().into_boxed_slice())
    }
}
