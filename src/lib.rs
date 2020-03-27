#[macro_use]
extern crate deno_core;
#[macro_use]
extern crate lazy_static;
extern crate futures;
extern crate serde;
extern crate serde_json;
extern crate webview_sys;

use deno_core::{CoreOp, Op, PluginInitContext, ZeroCopyBuf};
use futures::future::FutureExt;
use serde::{Deserialize, Serialize};
use std::sync::atomic::{AtomicUsize, Ordering};
use std::{collections::HashMap, ffi::CString, ptr::null_mut, sync::Mutex};
use webview_sys::*;

lazy_static! {
    static ref INSTANCE_MAP: Mutex<HashMap<usize, Instance>> = Mutex::new(HashMap::new());
    static ref INSTANCE_ID: AtomicUsize = AtomicUsize::new(0);
}

struct Instance {
    webview: *mut CWebView,
}

unsafe impl Send for Instance {}
unsafe impl Sync for Instance {}

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
    context.register_op("webview_run", Box::new(op_webview_run));
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
    id: usize,
}

fn op_webview_new(data: &[u8], _zero_copy: Option<ZeroCopyBuf>) -> CoreOp {
    unsafe {
        let mut response: WebViewResponse<WebViewNewResult> = WebViewResponse {
            err: None,
            ok: None,
        };

        let params: WebViewNewParams = serde_json::from_slice(data).unwrap();

        let instance_id: usize = INSTANCE_ID.fetch_add(1, Ordering::SeqCst);

        let title = CString::new(params.title).unwrap();
        let url = CString::new(params.url).unwrap();

        INSTANCE_MAP.lock().unwrap().insert(
            instance_id,
            Instance {
                webview: webview_new(
                    title.as_ptr(),
                    url.as_ptr(),
                    params.width,
                    params.height,
                    params.resizable as _,
                    params.debug as _,
                    params.frameless as _,
                    None,
                    null_mut(),
                ),
            },
        );

        response.ok = Some(WebViewNewResult { id: instance_id });

        Op::Sync(serde_json::to_vec(&response).unwrap().into_boxed_slice())
    }
}

#[derive(Deserialize)]
struct WebViewExitParams {
    id: usize,
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

        let instance_map = INSTANCE_MAP.lock().unwrap();

        if !instance_map.contains_key(&params.id) {
            response.err = Some(format!("Could not find instance of id {}", &params.id))
        } else {
            webview_exit(instance_map.get(&params.id).unwrap().webview);

            response.ok = Some(WebViewExitResult {});
        }

        Op::Sync(serde_json::to_vec(&response).unwrap().into_boxed_slice())
    }
}

#[derive(Deserialize)]
struct WebViewEvalParams {
    id: usize,
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

        let instance_map = INSTANCE_MAP.lock().unwrap();

        if !instance_map.contains_key(&params.id) {
            response.err = Some(format!("Could not find instance of id {}", &params.id))
        } else {
            let js = CString::new(params.js).unwrap();

            match webview_eval(instance_map.get(&params.id).unwrap().webview, js.as_ptr()) {
                0 => {
                    response.ok = Some(WebViewEvalResult {});
                }
                _ => response.err = Some("Could not evaluate javascript".to_string()),
            }
        }

        Op::Sync(serde_json::to_vec(&response).unwrap().into_boxed_slice())
    }
}

#[derive(Deserialize)]
struct WebViewSetColorParams {
    id: usize,
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

        let instance_map = INSTANCE_MAP.lock().unwrap();

        if !instance_map.contains_key(&params.id) {
            response.err = Some(format!("Could not find instance of id {}", &params.id))
        } else {
            webview_set_color(
                instance_map.get(&params.id).unwrap().webview,
                params.r,
                params.g,
                params.b,
                params.a,
            );

            response.ok = Some(WebViewSetColorResult {});
        }

        Op::Sync(serde_json::to_vec(&response).unwrap().into_boxed_slice())
    }
}

#[derive(Deserialize)]
struct WebViewSetTitleParams {
    id: usize,
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

        let instance_map = INSTANCE_MAP.lock().unwrap();

        if !instance_map.contains_key(&params.id) {
            response.err = Some(format!("Could not find instance of id {}", &params.id))
        } else {
            let title = CString::new(params.title).unwrap();

            webview_set_title(
                instance_map.get(&params.id).unwrap().webview,
                title.as_ptr(),
            );

            response.ok = Some(WebViewSetTitleResult {});
        }

        Op::Sync(serde_json::to_vec(&response).unwrap().into_boxed_slice())
    }
}

#[derive(Deserialize)]
struct WebViewSetFullscreenParams {
    id: usize,
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

        let instance_map = INSTANCE_MAP.lock().unwrap();

        if !instance_map.contains_key(&params.id) {
            response.err = Some(format!("Could not find instance of id {}", &params.id))
        } else {
            webview_set_fullscreen(
                instance_map.get(&params.id).unwrap().webview,
                params.fullscreen as _,
            );

            response.ok = Some(WebViewSetFullscreenResult {});
        }

        Op::Sync(serde_json::to_vec(&response).unwrap().into_boxed_slice())
    }
}

#[derive(Deserialize)]
struct WebViewLoopParams {
    id: usize,
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

        let instance_map = INSTANCE_MAP.lock().unwrap();

        if !instance_map.contains_key(&params.id) {
            response.err = Some(format!("Could not find instance of id {}", &params.id))
        } else {
            response.ok = Some(WebViewLoopResult {
                code: webview_loop(
                    instance_map.get(&params.id).unwrap().webview,
                    params.blocking,
                ),
            });
        }

        Op::Sync(serde_json::to_vec(&response).unwrap().into_boxed_slice())
    }
}

#[derive(Deserialize)]
struct WebViewRunParams {
    id: usize,
}

#[derive(Serialize)]
struct WebViewRunResult {}

fn op_webview_run(data: &[u8], _zero_copy: Option<ZeroCopyBuf>) -> CoreOp {
    unsafe {
        let mut response: WebViewResponse<WebViewRunResult> = WebViewResponse {
            err: None,
            ok: None,
        };

        let params: WebViewRunParams = serde_json::from_slice(data).unwrap();

        let fut = async move {
            let instance_map = INSTANCE_MAP.lock().unwrap();

            if !instance_map.contains_key(&params.id) {
                response.err = Some(format!("Could not find instance of id {}", &params.id))
            } else {
                loop {
                    match webview_loop(instance_map.get(&params.id).unwrap().webview, 1) {
                        0 => (),
                        _ => {
                            response.ok = Some(WebViewRunResult {});
                        }
                    }
                }
            }

            Ok(serde_json::to_vec(&response).unwrap().into_boxed_slice())
        };

        Op::Async(fut.boxed())
    }
}
