use deno_core::error::anyhow;
use deno_core::error::AnyError;

use deno_core::plugin_api::Interface;
use deno_core::plugin_api::Op;
use deno_core::plugin_api::ZeroCopyBuf;

use deno_core::serde_json::json;
use deno_core::serde_json::Value;

use deno_json_op::json_op;

use std::cell::RefCell;
use std::collections::HashMap;
use std::ffi::CString;
use std::os::raw::c_int;
use std::ptr::null_mut;

thread_local! {
  static INSTANCE_INDEX: RefCell<u64> = RefCell::new(0);
  static INSTANCE_MAP: RefCell<HashMap<u64, *mut webview_sys::CWebView>> = RefCell::new(HashMap::new());
}

#[no_mangle]
pub fn deno_plugin_init(interface: &mut dyn Interface) {
  interface.register_op("webview_free", webview_free);
  interface.register_op("webview_new", webview_new);
  interface.register_op("webview_exit", webview_exit);
  interface.register_op("webview_eval", webview_eval);
  interface.register_op("webview_loop", webview_loop);
  interface.register_op("webview_set_color", webview_set_color);
  interface.register_op("webview_set_fullscreen", webview_set_fullscreen);
  interface.register_op("webview_set_maximized", webview_set_maximized);
  interface.register_op("webview_set_minimized", webview_set_minimized);
  interface.register_op("webview_set_title", webview_set_title);
  interface.register_op("webview_set_visible", webview_set_visible);
}

#[json_op]
fn webview_free(
  json: Value,
  _zero_copy: &mut [ZeroCopyBuf],
) -> Result<Value, AnyError> {
  let id = json["id"].as_u64().unwrap();

  INSTANCE_MAP.with(|cell| {
    let instance_map = cell.borrow_mut();

    if let Some(instance) = instance_map.get(&id) {
      unsafe {
        webview_sys::webview_free(*instance);
      }

      Ok(json!(()))
    } else {
      Err(anyhow!("Could not find instance with id: {}", id))
    }
  })
}

#[json_op]
fn webview_new(
  json: Value,
  _zero_copy: &mut [ZeroCopyBuf],
) -> Result<Value, AnyError> {
  let title = CString::new(json["title"].as_str().unwrap()).unwrap();
  let url = CString::new(json["url"].as_str().unwrap()).unwrap();
  let width = json["width"].as_i64().unwrap() as c_int;
  let height = json["height"].as_i64().unwrap() as c_int;
  let min_width = json["minWidth"].as_i64().unwrap() as c_int;
  let min_height = json["minHeight"].as_i64().unwrap() as c_int;
  let resizable = json["resizable"].as_bool().unwrap() as c_int;
  let debug = json["debug"].as_bool().unwrap() as c_int;
  let frameless = json["frameless"].as_bool().unwrap() as c_int;
  let visible = json["visible"].as_bool().unwrap() as c_int;

  let mut id = 0;
  INSTANCE_INDEX.with(|cell| {
    id = cell.replace_with(|&mut i| i + 1);
  });

  INSTANCE_MAP.with(|cell| {
    cell.borrow_mut().insert(id, unsafe {
      webview_sys::webview_new(
        title.as_ptr(),
        url.as_ptr(),
        width,
        height,
        resizable,
        debug,
        frameless,
        visible,
        min_width,
        min_height,
        None, // Some(ffi_invoke_handler),
        null_mut(),
      )
    });
  });

  Ok(json!(id))
}

#[json_op]
fn webview_loop(
  json: Value,
  _zero_copy: &mut [ZeroCopyBuf],
) -> Result<Value, AnyError> {
  let id = json["id"].as_u64().unwrap();
  let block = json["block"].as_bool().unwrap() as c_int;

  INSTANCE_MAP.with(|cell| {
    let instance_map = cell.borrow_mut();

    if let Some(instance) = instance_map.get(&id) {
      let res = unsafe { webview_sys::webview_loop(*instance, block) };

      Ok(json!(res))
    } else {
      Err(anyhow!("Could not find instance with id: {}", id))
    }
  })
}

#[json_op]
fn webview_exit(
  json: Value,
  _zero_copy: &mut [ZeroCopyBuf],
) -> Result<Value, AnyError> {
  let id = json["id"].as_u64().unwrap();

  INSTANCE_MAP.with(|cell| {
    let instance_map = cell.borrow_mut();

    if let Some(instance) = instance_map.get(&id) {
      unsafe {
        webview_sys::webview_exit(*instance);
      }

      Ok(json!(()))
    } else {
      Err(anyhow!("Could not find instance with id: {}", id))
    }
  })
}

#[json_op]
fn webview_eval(
  json: Value,
  _zero_copy: &mut [ZeroCopyBuf],
) -> Result<Value, AnyError> {
  let id = json["id"].as_u64().unwrap();
  let js = CString::new(json["js"].as_str().unwrap()).unwrap();

  INSTANCE_MAP.with(|cell| {
    let instance_map = cell.borrow_mut();

    if let Some(instance) = instance_map.get(&id) {
      let res = unsafe { webview_sys::webview_eval(*instance, js.as_ptr()) };

      Ok(json!(res))
    } else {
      Err(anyhow!("Could not find instance with id: {}", id))
    }
  })
}

#[json_op]
fn webview_set_title(
  json: Value,
  _zero_copy: &mut [ZeroCopyBuf],
) -> Result<Value, AnyError> {
  let id = json["id"].as_u64().unwrap();
  let title = CString::new(json["title"].as_str().unwrap()).unwrap();

  INSTANCE_MAP.with(|cell| {
    let instance_map = cell.borrow_mut();

    if let Some(instance) = instance_map.get(&id) {
      unsafe {
        webview_sys::webview_set_title(*instance, title.as_ptr());
      }

      Ok(json!(()))
    } else {
      Err(anyhow!("Could not find instance with id: {}", id))
    }
  })
}

#[json_op]
fn webview_set_fullscreen(
  json: Value,
  _zero_copy: &mut [ZeroCopyBuf],
) -> Result<Value, AnyError> {
  let id = json["id"].as_u64().unwrap();
  let fullscreen = json["fullscreen"].as_bool().unwrap() as c_int;

  INSTANCE_MAP.with(|cell| {
    let instance_map = cell.borrow_mut();

    if let Some(instance) = instance_map.get(&id) {
      unsafe {
        webview_sys::webview_set_fullscreen(*instance, fullscreen);
      }

      Ok(json!(()))
    } else {
      Err(anyhow!("Could not find instance with id: {}", id))
    }
  })
}

#[json_op]
fn webview_set_maximized(
  json: Value,
  _zero_copy: &mut [ZeroCopyBuf],
) -> Result<Value, AnyError> {
  let id = json["id"].as_u64().unwrap();
  let maximized = json["maximized"].as_bool().unwrap() as c_int;

  INSTANCE_MAP.with(|cell| {
    let instance_map = cell.borrow_mut();

    if let Some(instance) = instance_map.get(&id) {
      unsafe {
        webview_sys::webview_set_maximized(*instance, maximized);
      }

      Ok(json!(()))
    } else {
      Err(anyhow!("Could not find instance with id: {}", id))
    }
  })
}

#[json_op]
fn webview_set_minimized(
  json: Value,
  _zero_copy: &mut [ZeroCopyBuf],
) -> Result<Value, AnyError> {
  let id = json["id"].as_u64().unwrap();
  let minimized = json["minimized"].as_bool().unwrap() as c_int;

  INSTANCE_MAP.with(|cell| {
    let instance_map = cell.borrow_mut();

    if let Some(instance) = instance_map.get(&id) {
      unsafe {
        webview_sys::webview_set_minimized(*instance, minimized);
      }

      Ok(json!(()))
    } else {
      Err(anyhow!("Could not find instance with id: {}", id))
    }
  })
}

#[json_op]
fn webview_set_visible(
  json: Value,
  _zero_copy: &mut [ZeroCopyBuf],
) -> Result<Value, AnyError> {
  let id = json["id"].as_u64().unwrap();
  let visible = json["visible"].as_bool().unwrap() as c_int;

  INSTANCE_MAP.with(|cell| {
    let instance_map = cell.borrow_mut();

    if let Some(instance) = instance_map.get(&id) {
      unsafe {
        webview_sys::webview_set_visible(*instance, visible);
      }

      Ok(json!(()))
    } else {
      Err(anyhow!("Could not find instance with id: {}", id))
    }
  })
}

#[json_op]
fn webview_set_color(
  json: Value,
  _zero_copy: &mut [ZeroCopyBuf],
) -> Result<Value, AnyError> {
  let id = json["id"].as_u64().unwrap();
  let r = json["r"].as_u64().unwrap() as u8;
  let g = json["g"].as_u64().unwrap() as u8;
  let b = json["b"].as_u64().unwrap() as u8;
  let a = json["a"].as_u64().unwrap() as u8;

  INSTANCE_MAP.with(|cell| {
    let instance_map = cell.borrow_mut();

    if let Some(instance) = instance_map.get(&id) {
      unsafe {
        webview_sys::webview_set_color(*instance, r, g, b, a);
      }

      Ok(json!(()))
    } else {
      Err(anyhow!("Could not find instance with id: {}", id))
    }
  })
}
