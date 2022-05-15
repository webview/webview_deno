use std::ffi::CStr;
use std::os::raw::c_char;
use std::os::raw::c_int;
use std::os::raw::c_void;
use std::sync::mpsc::channel;
use std::sync::mpsc::Receiver;
use std::sync::mpsc::Sender;
use webview_official_sys::webview_t;
use webview_official_sys::DispatchFn;

type WebviewChannelData = (String, String);
type WebviewChannel =
  (Sender<WebviewChannelData>, Receiver<WebviewChannelData>);

macro_rules! export {
    ($rename: ident, fn $name:ident($( $arg:ident : $type:ty ),*) -> $ret:ty) => {
        #[no_mangle]
        #[doc = "# Safety"]
        #[doc = ""]
        #[doc = "This function is unsafe for obvious reasons."]
        pub unsafe extern "C" fn $rename($( $arg : $type),*) -> $ret {
            webview_official_sys::$name($( $arg ),*)
        }
    };
    ($rename: ident, fn $name:ident($( $arg:ident : $type:ty ),*)) => {
        export!($rename, fn $name($( $arg : $type),*) -> ());
    }
}

// https://github.com/rust-lang/rfcs/issues/2771
export!(deno_webview_create, fn webview_create(debug: c_int, window: *mut c_void) -> webview_t);
export!(deno_webview_destroy, fn webview_destroy(w: webview_t));
export!(deno_webview_step, fn webview_step(w: webview_t, blocking: i32) -> i32);
export!(deno_webview_run, fn webview_run(w: webview_t));
export!(deno_webview_terminate, fn webview_terminate(w: webview_t));
export!(deno_webview_dispatch, fn webview_dispatch(w: webview_t, fn_: Option<DispatchFn>, arg: *mut c_void));
export!(deno_webview_get_window, fn webview_get_window(w: webview_t) -> *mut c_void);
export!(deno_webview_set_title, fn webview_set_title(w: webview_t, title: *const c_char));
export!(deno_webview_set_size, fn webview_set_size(w: webview_t, width: c_int, height: c_int, hints: c_int));
export!(deno_webview_navigate, fn webview_navigate(w: webview_t, url: *const c_char));
export!(deno_webview_init, fn webview_init(w: webview_t, js: *const c_char));
export!(deno_webview_eval, fn webview_eval(w: webview_t, js: *const c_char));
export!(deno_webview_return, fn webview_return(w: webview_t, seq: *const c_char, status: c_int, result: *const c_char));

/// # Safety
///
/// Webview pointer must be non NULL. It must be obtained using
/// `deno_webview_create`.
#[no_mangle]
pub unsafe extern "C" fn deno_webview_bind(
  w: webview_t,
  name: *const c_char,
) -> *mut WebviewChannel {
  extern "C" fn callback(
    seq: *const c_char,
    req: *const c_char,
    channel_ptr: *mut c_void,
  ) {
    let channel_ptr = channel_ptr as *mut WebviewChannel;
    let (sender, _) = unsafe { &*channel_ptr };

    let seq = unsafe {
      CStr::from_ptr(seq)
        .to_str()
        .expect("No null bytes in parameter seq")
    }
    .to_string();
    let req = unsafe {
      CStr::from_ptr(req)
        .to_str()
        .expect("No null bytes in parameter req")
    }
    .to_string();

    sender.send((seq, req)).unwrap();
  }

  let channel_ptr = Box::into_raw(Box::new(channel::<WebviewChannelData>()));

  webview_official_sys::webview_bind(
    w,
    name,
    Some(callback),
    channel_ptr as *mut c_void,
  );

  channel_ptr
}

/// # Safety
///
/// Channel pointer must be non NULL. It must be obtained using
/// `deno_webview_bind`.
#[no_mangle]
pub extern "C" fn deno_webview_channel_recv(
  channel_ptr: *mut WebviewChannel,
) -> *const u8 {
  let channel_ptr = channel_ptr as *mut WebviewChannel;
  let (_, receiver) = unsafe { &*channel_ptr };

  if let Ok(recv) = receiver.recv() {
    let mut recv_buf = Vec::new();

    recv_buf.extend_from_slice(&u32::to_ne_bytes(recv.0.len() as u32));
    recv_buf.extend_from_slice(recv.0.as_bytes());
    recv_buf.extend_from_slice(&u32::to_ne_bytes(recv.1.len() as u32));
    recv_buf.extend_from_slice(recv.1.as_bytes());

    let ptr = recv_buf.as_ptr();
    std::mem::forget(recv_buf);
    ptr
  } else {
    std::ptr::null()
  }
}

/// # Safety
///
/// Channel recv pointer must be non NULL. It must be obtained using
/// `deno_webview_channel_recv` and can no longer be used after being freed by
/// this function
#[no_mangle]
pub unsafe extern "C" fn deno_webview_channel_recv_free(recv_ptr: *mut u8) {
  let seq_len = *(recv_ptr as *const u32);
  let req_len = *(recv_ptr.add(4 + seq_len as usize) as *const u32);
  let recv_len = 4 + seq_len + 4 + req_len;
  let _ = std::slice::from_raw_parts(recv_ptr, recv_len as usize);
}

/// # Safety
///
/// Channel pointer must be non NULL. It must be obtained using
/// `deno_webview_bind` and can no longer be used after being freed by this
/// function.
#[no_mangle]
pub unsafe extern "C" fn deno_webview_channel_free(
  channel_ptr: *mut WebviewChannel,
) {
  Box::from_raw(channel_ptr);
}
