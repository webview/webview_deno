use deno_core::plugin_api::Buf;
use deno_core::plugin_api::Interface;
use deno_core::plugin_api::Op;
use deno_core::plugin_api::ZeroCopyBuf;

use futures::future::FutureExt;

use serde::Deserialize;
use serde::Serialize;

use webview_official::{WebviewBuilder, WebviewMut, SizeHint, Webview};
use serde_json::json;
use lazy_static::lazy_static;

use std::collections::HashMap;
use std::sync::{Mutex, Arc};
use std::thread::{self, JoinHandle};
use std::cell::RefCell;
use std::sync::mpsc::{channel, Sender, Receiver};

pub fn sync_response<T>(data: T) -> Buf
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

#[no_mangle]
pub fn deno_plugin_init(interface: &mut dyn Interface) {
  interface.register_op("webview_create", op_webview_create);
  interface.register_op("webview_run", op_webview_run);
  interface.register_op("webview_terminate", op_webview_terminate);
  interface.register_op("webview_set_title", op_webview_set_title);
  interface.register_op("webview_set_size", op_webview_set_size);
  interface.register_op("webview_navigate", op_webview_navigate);
  interface.register_op("webview_init", op_webview_init);
  interface.register_op("webview_eval", op_webview_eval);
}

#[derive(Serialize)]
struct WebviewResponse<T> {
  err: Option<String>,
  ok: Option<T>,
}

#[derive(Deserialize)]
struct WebviewIdParams {
  id: usize,
}

#[derive(Serialize)]
struct WebviewEmptyResult { }

#[derive(Deserialize)]
struct WebviewCreateParams {
  debug: bool,
}

#[derive(Serialize)]
struct WebviewCreateResult {
  id: usize,
}

lazy_static! {
  static ref CHANNELS: Mutex<HashMap<usize, (Sender<WebviewEvent>, Receiver<WebviewEvent>)>> = Mutex::new(HashMap::new());
  static ref NEXT_ID: Mutex<usize> = Mutex::new(0);
}

thread_local! {
  static WEBVIEW: RefCell<Option<WebviewMut>> = RefCell::new(None);
}

enum WebviewEvent {
  Create(bool),
  Run,
  Terminate, // i think we should stop at this for a quick demo to see if we are on the right track
  // SetTitle(WebviewSetSizeParams), // Good idea

  Ok
}

fn op_webview_create(
  _interface: &mut dyn Interface,
  zero_copy: &mut [ZeroCopyBuf],
) -> Op {
  let buf = &zero_copy[0][..];
  let params: WebviewCreateParams = serde_json::from_slice(buf).unwrap();

  let (threadSender, rx1) = channel::<WebviewEvent>();
  let (tx2, threadReciever) = channel::<WebviewEvent>();

  thread::spawn(move || loop {

    let event = threadReciever.recv().unwrap();

    match event {
      WebviewEvent::Create(debug) =>
        WEBVIEW.with(|webview| {
          if let None = *webview.borrow_mut() {
            // IF SOMETHING DOES NOT WORK IS THIS THE PROBLEM:
            *webview.borrow_mut() = Some(Webview::create(debug, None).as_mut()); // I think we succeeded in creating a webview instance on the create event
          }
        }),
      WebviewEvent::Run => 
        WEBVIEW.with(|webview| {
          if let Some(webview) = &mut *webview.borrow_mut() {
            webview.dispatch(|w| {
              w.run();
            });
          }
        }),
      WebviewEvent::Terminate => {
        WEBVIEW.with(|webview| {
          if let Some(webview) = &mut *webview.borrow_mut() { // fucking genious
            webview.terminate();
          }
        });
      },
      _ => {}
    }

    tx2.send(WebviewEvent::Ok).unwrap();
  });

  threadSender.send(WebviewEvent::Create(false)).unwrap();
  rx1.recv().unwrap();

  // How in the fuck did that not error and (prob) work first try
  let id = *NEXT_ID.lock().unwrap();
  CHANNELS.lock().unwrap().insert(id, (threadSender, rx1));
  *NEXT_ID.lock().unwrap() += 1;

  Op::Sync(sync_response(WebviewCreateResult {
    id
  }))
}

// found a few issues with caching Plug. 
// alright but thats for later

fn op_webview_run(
  _interface: &mut dyn Interface,
  zero_copy: &mut [ZeroCopyBuf],
) -> Op {
  let buf = &zero_copy[0][..];
  let params: WebviewIdParams = serde_json::from_slice(buf).unwrap();

  let channels = CHANNELS.lock().unwrap();
  if !channels.contains_key(&params.id) {
    // not ok
  } else {
    let channel = channels.get(&params.id);

    if let Some(channel) = channel {
      channel.0.send(WebviewEvent::Run).unwrap(); // maybe this works? ; no need for parenthesis, removed that for the stuff only requiring id
      channel.1.recv().unwrap();
    }
  }
  
  Op::Sync(sync_response(WebviewEmptyResult { }))
}

fn op_webview_terminate(
  _interface: &mut dyn Interface,
  zero_copy: &mut [ZeroCopyBuf],
) -> Op {
  let buf = &zero_copy[0][..];
  let params: WebviewIdParams = serde_json::from_slice(buf).unwrap();

  let channels = CHANNELS.lock().unwrap();
  if !channels.contains_key(&params.id) {
    // not ok
  } else {
    let channel = channels.get(&params.id);

    if let Some(channel) = channel {
      channel.0.send(WebviewEvent::Terminate).unwrap(); // maybe this works? ; no need for parenthesis, removed that for the stuff only requiring id
      channel.1.recv().unwrap();
    }
  }

  Op::Sync(sync_response(WebviewEmptyResult { }))
}

#[derive(Deserialize)]
struct WebviewSetTitleParams {
  title: String,
}

fn op_webview_set_title(
  _interface: &mut dyn Interface,
  zero_copy: &mut [ZeroCopyBuf],
) -> Op {
  let buf = &zero_copy[0][..];
  let params: WebviewSetTitleParams = serde_json::from_slice(buf).unwrap();
  
  Op::Sync(sync_response(WebviewEmptyResult { }))
}

#[derive(Deserialize)]
struct WebviewSetSizeParams {
  width: u32,
  height: u32,
  hint: u32,
}

fn op_webview_set_size(
  _interface: &mut dyn Interface,
  zero_copy: &mut [ZeroCopyBuf],
) -> Op {
  let buf = &zero_copy[0][..];
  let params: WebviewSetSizeParams = serde_json::from_slice(buf).unwrap();
  
  Op::Sync(sync_response(WebviewEmptyResult { }))
}

#[derive(Deserialize)]
struct WebviewNavigateParams {
  url: String,
}

fn op_webview_navigate(
  _interface: &mut dyn Interface,
  zero_copy: &mut [ZeroCopyBuf],
) -> Op {
  let buf = &zero_copy[0][..];
  let params: WebviewNavigateParams = serde_json::from_slice(buf).unwrap();
  
  Op::Sync(sync_response(WebviewEmptyResult { }))
}

#[derive(Deserialize)]
struct WebviewJsParams {
  js: String,
}

fn op_webview_init(
  _interface: &mut dyn Interface,
  zero_copy: &mut [ZeroCopyBuf],
) -> Op {
  let buf = &zero_copy[0][..];
  let params: WebviewJsParams = serde_json::from_slice(buf).unwrap();
  
  Op::Sync(sync_response(WebviewEmptyResult { }))
}

fn op_webview_eval(
  _interface: &mut dyn Interface,
  zero_copy: &mut [ZeroCopyBuf],
) -> Op {
  let buf = &zero_copy[0][..];
  let params: WebviewJsParams = serde_json::from_slice(buf).unwrap();
  
  Op::Sync(sync_response(WebviewEmptyResult { }))
}