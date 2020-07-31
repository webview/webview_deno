use deno_core::plugin_api::Buf;
use deno_core::plugin_api::Interface;
use deno_core::plugin_api::Op;
use deno_core::plugin_api::ZeroCopyBuf;

use futures::future::FutureExt;

use serde::Deserialize;
use serde::Serialize;
use serde_json::json;

use std::cell::RefCell;
use std::collections::HashMap;
// use std::ffi::CStr;
use std::ffi::CString;
// use std::os::raw::*;
use std::ptr::null_mut;

use webview_official_sys::*;

thread_local! {
  static INSTANCE_INDEX: RefCell<u32> = RefCell::new(0);
  static INSTANCE_MAP: RefCell<HashMap<u32, webview_t>> = RefCell::new(HashMap::new());
}

#[no_mangle]
pub fn deno_plugin_init(interface: &mut dyn Interface) {
  interface.register_op("webview_create", op_webview_create);
  interface.register_op("webview_destroy", op_webview_destroy);
  interface.register_op("webview_terminate", op_webview_terminate);
  interface.register_op("webview_set_title", op_webview_set_title);
  interface.register_op("webview_set_size", op_webview_set_size);
  interface.register_op("webview_navigate", op_webview_navigate);
  interface.register_op("webview_eval", op_webview_eval);
  interface.register_op("webview_init", op_webview_init);
  interface.register_op("webview_run", op_webview_run);
}

#[derive(Serialize)]
struct WebviewResponse<T = ()> {
  err: Option<String>,
  ok: Option<T>,
}

pub fn sync_ok<T>(data: T) -> Buf
where
  T: Serialize,
{
  let result = WebviewResponse {
    ok: Some(data),
    err: None,
  };

  let json = json!(result);
  let data = serde_json::to_vec(&json).unwrap();
  Buf::from(data)
}

pub fn sync_err(msg: String) -> Buf {
  let result: WebviewResponse<()> = WebviewResponse {
    ok: None,
    err: Some(msg),
  };

  let json = json!(result);
  let data = serde_json::to_vec(&json).unwrap();
  Buf::from(data)
}

#[derive(Deserialize)]
struct WebviewIdParams {
  id: u32,
}
#[derive(Deserialize)]
struct WebviewJsParams {
  id: u32,
  js: String,
}

#[derive(Deserialize)]
struct WebviewUrlParams {
  id: u32,
  url: String,
}

#[derive(Serialize)]
struct WebviewEmptyResult {}

#[derive(Deserialize)]
struct WebviewCreateParams {
  debug: bool,
}

#[derive(Serialize)]
struct WebviewCreateResult {
  id: u32,
}

fn op_webview_create(
  _interface: &mut dyn Interface,
  zero_copy: &mut [ZeroCopyBuf],
) -> Op {
  let buf = &zero_copy[0][..];
  let params: WebviewCreateParams = serde_json::from_slice(buf).unwrap();

  let mut instance_id: u32 = 0;
  INSTANCE_INDEX.with(|cell| {
    instance_id = cell.replace_with(|&mut i| i + 1);
  });

  INSTANCE_MAP.with(|cell| {
    cell.borrow_mut().insert(instance_id, unsafe {
      webview_create(
        match params.debug {
          true => 1,
          false => 0,
        },
        null_mut(),
      )
    });
  });

  Op::Sync(sync_ok(WebviewCreateResult { id: instance_id }))
}

fn op_webview_destroy(
  _interface: &mut dyn Interface,
  zero_copy: &mut [ZeroCopyBuf],
) -> Op {
  let buf = &zero_copy[0][..];
  let params: WebviewIdParams = serde_json::from_slice(buf).unwrap();

  let mut ret = None;

  INSTANCE_MAP.with(|cell| {
    let instance_map = cell.borrow_mut();

    if !instance_map.contains_key(&params.id) {
      ret = Some(sync_err(format!(
        "Could not find instance of id {}",
        &params.id
      )));
    } else {
      let instance: webview_t = *instance_map.get(&params.id).unwrap();

      unsafe {
        webview_destroy(instance);
      }

      ret = Some(sync_ok(WebviewEmptyResult {}));
    }
  });

  Op::Sync(ret.unwrap())
}

fn op_webview_terminate(
  _interface: &mut dyn Interface,
  zero_copy: &mut [ZeroCopyBuf],
) -> Op {
  let buf = &zero_copy[0][..];
  let params: WebviewIdParams = serde_json::from_slice(buf).unwrap();

  let mut ret = None;

  INSTANCE_MAP.with(|cell| {
    let instance_map = cell.borrow_mut();

    if !instance_map.contains_key(&params.id) {
      ret = Some(sync_err(format!(
        "Could not find instance of id {}",
        &params.id
      )));
    } else {
      let instance: webview_t = *instance_map.get(&params.id).unwrap();

      unsafe {
        webview_terminate(instance);
      }

      ret = Some(sync_ok(WebviewEmptyResult {}));
    }
  });

  Op::Sync(ret.unwrap())
}

fn op_webview_navigate(
  _interface: &mut dyn Interface,
  zero_copy: &mut [ZeroCopyBuf],
) -> Op {
  let buf = &zero_copy[0][..];
  let params: WebviewUrlParams = serde_json::from_slice(buf).unwrap();

  let mut ret = None;

  INSTANCE_MAP.with(|cell| {
    let instance_map = cell.borrow_mut();

    if !instance_map.contains_key(&params.id) {
      ret = Some(sync_err(format!(
        "Could not find instance of id {}",
        &params.id
      )));
    } else {
      let instance: webview_t = *instance_map.get(&params.id).unwrap();
      let url = CString::new(params.url).unwrap();
      unsafe { webview_navigate(instance, url.as_ptr()) };
      ret = Some(sync_ok(WebviewEmptyResult {}));
    }
  });

  Op::Sync(ret.unwrap())
}

fn op_webview_eval(
  _interface: &mut dyn Interface,
  zero_copy: &mut [ZeroCopyBuf],
) -> Op {
  let buf = &zero_copy[0][..];
  let params: WebviewJsParams = serde_json::from_slice(buf).unwrap();

  let mut ret = None;

  INSTANCE_MAP.with(|cell| {
    let instance_map = cell.borrow_mut();

    if !instance_map.contains_key(&params.id) {
      ret = Some(sync_err(format!(
        "Could not find instance of id {}",
        &params.id
      )));
    } else {
      let instance: webview_t = *instance_map.get(&params.id).unwrap();
      let js = CString::new(params.js).unwrap();
      unsafe { webview_eval(instance, js.as_ptr()) };
      ret = Some(sync_ok(WebviewEmptyResult {}));
    }
  });

  Op::Sync(ret.unwrap())
}

fn op_webview_init(
  _interface: &mut dyn Interface,
  zero_copy: &mut [ZeroCopyBuf],
) -> Op {
  let buf = &zero_copy[0][..];
  let params: WebviewJsParams = serde_json::from_slice(buf).unwrap();

  let mut ret = None;

  INSTANCE_MAP.with(|cell| {
    let instance_map = cell.borrow_mut();

    if !instance_map.contains_key(&params.id) {
      ret = Some(sync_err(format!(
        "Could not find instance of id {}",
        &params.id
      )));
    } else {
      let instance: webview_t = *instance_map.get(&params.id).unwrap();
      let js = CString::new(params.js).unwrap();
      unsafe { webview_init(instance, js.as_ptr()) };
      ret = Some(sync_ok(WebviewEmptyResult {}));
    }
  });

  Op::Sync(ret.unwrap())
}

#[derive(Deserialize)]
struct WebviewSetTitleParams {
  id: u32,
  title: String,
}

fn op_webview_set_title(
  _interface: &mut dyn Interface,
  zero_copy: &mut [ZeroCopyBuf],
) -> Op {
  let buf = &zero_copy[0][..];
  let params: WebviewSetTitleParams = serde_json::from_slice(buf).unwrap();
  let mut ret = None;

  INSTANCE_MAP.with(|cell| {
    let instance_map = cell.borrow_mut();

    if !instance_map.contains_key(&params.id) {
      ret = Some(sync_err(format!(
        "Could not find instance of id {}",
        &params.id
      )));
    } else {
      let instance: webview_t = *instance_map.get(&params.id).unwrap();

      let title = CString::new(params.title).unwrap();
      unsafe {
        webview_set_title(instance, title.as_ptr());
      }

      ret = Some(sync_ok(WebviewEmptyResult {}));
    }
  });

  Op::Sync(ret.unwrap())
}

#[derive(Deserialize)]
struct WebviewSetSizeParams {
  id: u32,
  width: i32,
  height: i32,
  hint: i32,
}

fn op_webview_set_size(
  _interface: &mut dyn Interface,
  zero_copy: &mut [ZeroCopyBuf],
) -> Op {
  let buf = &zero_copy[0][..];
  let params: WebviewSetSizeParams = serde_json::from_slice(buf).unwrap();

  let mut ret = None;

  INSTANCE_MAP.with(|cell| {
    let instance_map = cell.borrow_mut();

    if !instance_map.contains_key(&params.id) {
      ret = Some(sync_err(format!(
        "Could not find instance of id {}",
        &params.id
      )));
    } else {
      let instance: webview_t = *instance_map.get(&params.id).unwrap();

      unsafe {
        webview_set_size(instance, params.width, params.height, params.hint);
      }

      ret = Some(sync_ok(WebviewEmptyResult {}));
    }
  });

  Op::Sync(ret.unwrap())
}

fn op_webview_run(
  _interface: &mut dyn Interface,
  zero_copy: &mut [ZeroCopyBuf],
) -> Op {
  let buf = &zero_copy[0][..];
  let params: WebviewIdParams = serde_json::from_slice(buf).unwrap();

  let fut = async move {
    let mut ret = None;
    INSTANCE_MAP.with(|cell| {
      let instance_map = cell.borrow_mut();

      if !instance_map.contains_key(&params.id) {
        ret = Some(sync_err(format!(
          "Could not find instance of id {}",
          &params.id
        )));
      } else {
        let instance = *instance_map.get(&params.id).unwrap();

        unsafe { webview_run(instance) };

        ret = Some(sync_ok(WebviewEmptyResult {}))
      }
    });

    ret.unwrap()
  };

  Op::Async(fut.boxed())
}
