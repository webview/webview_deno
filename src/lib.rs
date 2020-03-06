#[macro_use]
extern crate deno_core;
extern crate futures;
extern crate serde;
extern crate serde_json;

use deno_core::CoreOp;
use deno_core::Op;
use deno_core::PluginInitContext;
use deno_core::ZeroCopyBuf;
use serde::{Deserialize, Serialize};
use web_view::*;

#[derive(Serialize, Deserialize)]
struct Options {
  title: String,
  width: i32,
  height: i32,
  resizable: bool,
  debug: bool,
  content: String,
}

fn init(context: &mut dyn PluginInitContext) {
  context.register_op("webview_run", Box::new(op_webview_run));
}
init_fn!(init);

pub fn op_webview_run(data: &[u8], zero_copy: Option<ZeroCopyBuf>) -> CoreOp {
  webview_run(std::str::from_utf8(data).unwrap()).unwrap();

  Op::Sync(Box::new([0]))
}

fn webview_run<'a>(data: &'a str) -> Result<(), serde_json::Error> {
  let options: Options = serde_json::from_str(data)?;

  let webview = web_view::builder()
    .title(&options.title)
    .content(Content::Html(options.content))
    .size(options.width, options.height)
    .resizable(options.resizable)
    .debug(options.debug)
    .user_data(())
    .invoke_handler(|_webview, _arg| Ok(()))
    .build()
    .unwrap();
  webview.run().unwrap();
  Ok(())
}
