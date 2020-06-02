use deno_core::plugin_api::Buf;
use deno_core::plugin_api::Interface;
use deno_core::plugin_api::Op;
use deno_core::plugin_api::ZeroCopyBuf;

use futures::future::FutureExt;

use serde::Deserialize;
use serde::Serialize;

use std::cell::RefCell;
use std::collections::HashMap;

use webview_rust_sys::*;

thread_local! {
    static INSTANCE_INDEX: RefCell<u32> = RefCell::new(0);
    static INSTANCE_MAP: RefCell<HashMap<u32, *mut Webview>> = RefCell::new(HashMap::new());
}

#[no_mangle]
pub fn deno_plugin_init(interface: &mut dyn Interface) {
    interface.register_op("webview_new", op_webview_new);
    interface.register_op("webview_exit", op_webview_exit);
    interface.register_op("webview_eval", op_webview_eval);
    interface.register_op("webview_set_title", op_webview_set_title);
    interface.register_op("webview_run", op_webview_run);

    // todo(lemarier): no binding available for the fullscreen
    interface.register_op("webview_set_fullscreen", op_not_implemented);
    // todo(lemarier): loop is not required as the run is not async
    interface.register_op("webview_loop", op_not_implemented);
    // todo(lemarier): there is no binding available
    interface.register_op("webview_set_color", op_not_implemented);
}

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

fn op_webview_new(
    _interface: &mut dyn Interface,
    data: &[u8],
    _zero_copy: Option<ZeroCopyBuf>,
) -> Op {
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
        if params.debug {
            println!("{}", params.url);
        }

        // todo(lemarier): Resizable & frameless aren't available on the rust binding
        if params.resizable || params.frameless {
            println!("resizable & frameless params not implemented yet");
        }

        let data = webview_create(params.debug, None);
        webview_set_title(data, &params.title);
        webview_set_size(data, params.width, params.height, SizeHint::NONE);
        webview_navigate(data, &params.url);
        cell.borrow_mut().insert(instance_id, data);
    });

    response.ok = Some(WebViewNewResult { id: instance_id });

    let result: Buf = serde_json::to_vec(&response).unwrap().into_boxed_slice();

    Op::Sync(result)
}

// extern "C" fn ffi_invoke_handler(webview: *mut CWebView, arg: *const c_char) {
//     unsafe {
//         let arg = CStr::from_ptr(arg).to_string_lossy().to_string();
//
//         println!("{}", arg);
//     }
// }

#[derive(Deserialize)]
struct WebViewExitParams {
    id: u32,
}

#[derive(Serialize)]
struct WebViewExitResult {}

fn op_webview_exit(
    _interface: &mut dyn Interface,
    data: &[u8],
    _zero_copy: Option<ZeroCopyBuf>,
) -> Op {
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
            let instance: *mut Webview = *instance_map.get(&params.id).unwrap();

            webview_destroy(instance);

            response.ok = Some(WebViewExitResult {});
        }
    });

    Op::Sync(serde_json::to_vec(&response).unwrap().into_boxed_slice())
}

#[derive(Deserialize)]
struct WebViewEvalParams {
    id: u32,
    js: String,
}

#[derive(Serialize)]
struct WebViewEvalResult {}

fn op_webview_eval(
    _interface: &mut dyn Interface,
    data: &[u8],
    _zero_copy: Option<ZeroCopyBuf>,
) -> Op {
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
            let instance: *mut Webview = *instance_map.get(&params.id).unwrap();
            webview_eval(instance, &params.js);
            response.ok = Some(WebViewEvalResult {});
        }
    });

    Op::Sync(serde_json::to_vec(&response).unwrap().into_boxed_slice())
}

#[derive(Deserialize)]
struct WebViewSetTitleParams {
    id: u32,
    title: String,
}

#[derive(Serialize)]
struct WebViewSetTitleResult {}

fn op_webview_set_title(
    _interface: &mut dyn Interface,
    data: &[u8],
    _zero_copy: Option<ZeroCopyBuf>,
) -> Op {
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
            let instance: *mut Webview = *instance_map.get(&params.id).unwrap();

            webview_set_title(instance, &params.title);

            response.ok = Some(WebViewSetTitleResult {});
        }
    });

    Op::Sync(serde_json::to_vec(&response).unwrap().into_boxed_slice())
}

#[derive(Deserialize)]
struct WebViewRunParams {
    id: u32,
}

#[derive(Serialize)]
struct WebViewRunResult {}

fn op_webview_run(
    _interface: &mut dyn Interface,
    data: &[u8],
    _zero_copy: Option<ZeroCopyBuf>,
) -> Op {
    let mut response: WebViewResponse<WebViewRunResult> = WebViewResponse {
        err: None,
        ok: None,
    };

    let params: WebViewRunParams = serde_json::from_slice(data).unwrap();

    let fut = async move {
        INSTANCE_MAP.with(|cell| {
            let instance_map = cell.borrow_mut();

            if !instance_map.contains_key(&params.id) {
                response.err = Some(format!("Could not find instance of id {}", &params.id))
            } else {
                let instance: *mut Webview = *instance_map.get(&params.id).unwrap();
                loop {
                    webview_run(instance);
                    response.ok = Some(WebViewRunResult {});
                }
            }
        });
        serde_json::to_vec(&response).unwrap().into_boxed_slice()
    };

    Op::Async(fut.boxed())
}

#[derive(Serialize)]
struct NotimplementedResult {}

fn op_not_implemented(
    _interface: &mut dyn Interface,
    _data: &[u8],
    _zero_copy: Option<ZeroCopyBuf>,
) -> Op {
    let mut response: WebViewResponse<NotimplementedResult> = WebViewResponse {
        err: None,
        ok: None,
    };

    response.err = Some(format!("Notimplemented"));
    Op::Sync(serde_json::to_vec(&response).unwrap().into_boxed_slice())
}
