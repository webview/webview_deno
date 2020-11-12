use deno_core::error::anyhow;
use deno_core::error::AnyError;

use deno_core::plugin_api::Interface;
use deno_core::plugin_api::Op;
use deno_core::plugin_api::ZeroCopyBuf;

use deno_core::futures;
use futures::future;
use futures::future::poll_fn;
use futures::future::FutureExt;

use deno_core::serde_json;
use serde_json::json;
use serde_json::Value;

use std::cell::RefCell;
use std::collections::HashMap;
use std::ptr::null_mut;

use webview_official_sys::*;

use deno_json_op::json_op;

thread_local! {
  static INSTANCE_INDEX: RefCell<u64> = RefCell::new(0);
  static INSTANCE_MAP: RefCell<HashMap<u64, webview_t>> = RefCell::new(HashMap::new());
}

#[no_mangle]
pub fn deno_plugin_init(interface: &mut dyn Interface) {
  interface.register_op("webview_create", op_webview_create);
  interface.register_op("webview_destroy", op_webview_destroy);
  interface.register_op("webview_run", op_webview_run);
  interface.register_op("webview_terminate", op_webview_terminate);
  interface.register_op("webview_set_title", op_webview_set_title);
  interface.register_op("webview_set_size", op_webview_set_size);
  interface.register_op("webview_navigate", op_webview_navigate);
  interface.register_op("webview_init", op_webview_init);
  interface.register_op("webview_eval", op_webview_eval);
}

#[json_op]
fn op_webview_create(
  json: Value,
  _zero_copy: &mut [ZeroCopyBuf],
) -> Result<Value, AnyError> {
  let debug = json.as_bool().unwrap();

  let mut id = 0;
  INSTANCE_INDEX.with(|cell| {
    id = cell.replace_with(|&mut i| i + 1);
  });

  INSTANCE_MAP.with(|cell| {
    cell.borrow_mut().insert(id, unsafe {
      webview_create(debug as i32, null_mut())
    });
  });

  Ok(json!(id))
}

#[json_op]
fn op_webview_destroy(
  json: Value,
  _zero_copy: &mut [ZeroCopyBuf],
) -> Result<Value, AnyError> {
  let id = json.as_u64().unwrap();

  let mut res = Ok(json!(()));

  INSTANCE_MAP.with(|cell| {
    let instance_map = cell.borrow_mut();

    if !instance_map.contains_key(&id) {
      res = Err(anyhow!(format!(
        "Could not find instance of id {}",
        &id
      )));
    } else {
      let instance: webview_t = *instance_map.get(&id).unwrap();

      unsafe {
        webview_destroy(instance);
      }
    }
  });

  res
}

#[json_op]
fn op_webview_run(
  json: Value,
  _zero_copy: &mut [ZeroCopyBuf],
) -> Result<Value, AnyError> {
  let id = json.as_u64().unwrap();

  let mut res = Ok(json!(()));

  INSTANCE_MAP.with(|cell| {
    let instance_map = cell.borrow_mut();

    if !instance_map.contains_key(&id) {
      res = Err(anyhow!(format!(
        "Could not find instance of id {}",
        &id
      )));
    } else {
      let instance: webview_t = *instance_map.get(&id).unwrap();

      unsafe {
        webview_run(instance);
      }
    }
  });

  res
}

#[json_op]
fn op_webview_terminate(
  json: Value,
  _zero_copy: &mut [ZeroCopyBuf],
) -> Result<Value, AnyError> {
  let mut res = Ok(json!(()));
  let id = json.as_u64().unwrap();

  INSTANCE_MAP.with(|cell| {
    let instance_map = cell.borrow_mut();

    if !instance_map.contains_key(&id) {
      res = Err(anyhow!(format!(
        "Could not find instance of id {}",
        &id
      )));
    } else {
      let instance: webview_t = *instance_map.get(&id).unwrap();

      unsafe {
        webview_terminate(instance);
      }
    }
  });

  res
}

#[json_op]
fn op_webview_set_title(
  json: Value,
  _zero_copy: &mut [ZeroCopyBuf],
) -> Result<Value, AnyError> {
  let mut res = Ok(json!(()));
  let arr = json.as_array().unwrap();
  let id = arr[0].as_u64().unwrap();
  let title = arr[1].as_str().unwrap();

  INSTANCE_MAP.with(|cell| {
    let instance_map = cell.borrow_mut();

    if !instance_map.contains_key(&id) {
      res = Err(anyhow!(format!(
        "Could not find instance of id {}",
        &id
      )));
    } else {
      let instance: webview_t = *instance_map.get(&id).unwrap();

      unsafe {
        webview_set_title(instance, title.as_ptr() as *const i8);
      }
    }
  });

  res
}

#[json_op]
fn op_webview_set_size(
  json: Value,
  _zero_copy: &mut [ZeroCopyBuf],
) -> Result<Value, AnyError> {
  let mut res = Ok(json!(()));
  let arr = json.as_array().unwrap();
  let id = arr[0].as_u64().unwrap();
  let width = arr[1].as_u64().unwrap() as i32;
  let height = arr[2].as_u64().unwrap() as i32;
  let hint = arr[3].as_u64().unwrap() as i32;

  INSTANCE_MAP.with(|cell| {
    let instance_map = cell.borrow_mut();

    if !instance_map.contains_key(&id) {
      res = Err(anyhow!(format!(
        "Could not find instance of id {}",
        &id
      )));
    } else {
      let instance: webview_t = *instance_map.get(&id).unwrap();

      unsafe {
        webview_set_size(instance, width, height, hint);
      }
    }
  });

  res
}

#[json_op]
fn op_webview_navigate(
  json: Value,
  _zero_copy: &mut [ZeroCopyBuf],
) -> Result<Value, AnyError> {
  let mut res = Ok(json!(()));
  let arr = json.as_array().unwrap();
  println!("{:?}", arr);
  let id = arr[0].as_u64().unwrap();
  let url = arr[1].as_str().unwrap();

  INSTANCE_MAP.with(|cell| {
    let instance_map = cell.borrow_mut();

    if !instance_map.contains_key(&id) {
      res = Err(anyhow!(format!(
        "Could not find instance of id {}",
        &id
      )));
    } else {
      let instance: webview_t = *instance_map.get(&id).unwrap();

      unsafe {
        webview_navigate(instance, url.as_ptr() as *const i8);
      }
    }
  });

  res
}

#[json_op]
fn op_webview_init(
  json: Value,
  _zero_copy: &mut [ZeroCopyBuf],
) -> Result<Value, AnyError> {
  let mut res = Ok(json!(()));
  let arr = json.as_array().unwrap();
  let id = arr[0].as_u64().unwrap();
  let js = arr[1].as_str().unwrap();

  INSTANCE_MAP.with(|cell| {
    let instance_map = cell.borrow_mut();

    if !instance_map.contains_key(&id) {
      res = Err(anyhow!(format!(
        "Could not find instance of id {}",
        &id
      )));
    } else {
      let instance: webview_t = *instance_map.get(&id).unwrap();

      unsafe {
        webview_init(instance, js.as_ptr() as *const i8);
      }
    }
  });

  res
}

#[json_op]
fn op_webview_eval(
  json: Value,
  _zero_copy: &mut [ZeroCopyBuf],
) -> Result<Value, AnyError> {
  let mut res = Ok(json!(()));
  let arr = json.as_array().unwrap();
  let id = arr[0].as_u64().unwrap();
  let js = arr[1].as_str().unwrap();

  INSTANCE_MAP.with(|cell| {
    let instance_map = cell.borrow_mut();

    if !instance_map.contains_key(&id) {
      res = Err(anyhow!(format!(
        "Could not find instance of id {}",
        &id
      )));
    } else {
      let instance: webview_t = *instance_map.get(&id).unwrap();

      unsafe {
        webview_eval(instance, js.as_ptr() as *const i8);
      }
    }
  });

  res
}
