#[macro_use]
extern crate deno_core;
extern crate serde;
extern crate serde_json;
extern crate webview_sys;

use deno_core::{CoreOp, Op, PluginInitContext, ZeroCopyBuf};
use serde::{Deserialize, Serialize};
use std::{ffi::CString, ptr::null_mut};
use webview_sys::*;

#[derive(Serialize, Deserialize)]
struct NewArgs {
    title: String,
    url: String,
    width: i32,
    height: i32,
    resizable: bool,
    debug: bool,
}

#[derive(Serialize, Deserialize)]
struct EvalArgs {
    js: String,
}

#[derive(Serialize, Deserialize)]
struct InjectCssArgs {
    css: String,
}

#[derive(Serialize, Deserialize)]
struct SetColorArgs {
    r: u8,
    g: u8,
    b: u8,
    a: u8,
}

#[derive(Serialize, Deserialize)]
struct SetTitleArgs {
    title: String,
}

#[derive(Serialize, Deserialize)]
struct SetFullscreenArgs {
    fullscreen: bool,
}

#[derive(Serialize, Deserialize)]
struct LoopArgs {
    blocking: i32,
}

static mut CWEBVIEW: Option<*mut CWebView> = None;

fn init(context: &mut dyn PluginInitContext) {
    context.register_op("webview_new", Box::new(op_webview_new));
    context.register_op("webview_exit", Box::new(op_webview_exit));
    context.register_op("webview_eval", Box::new(op_webview_eval));
    context.register_op("webview_inject_css", Box::new(op_webview_inject_css));
    context.register_op("webview_set_color", Box::new(op_webview_set_color));
    context.register_op("webview_set_title", Box::new(op_webview_set_title));
    context.register_op(
        "webview_set_fullscreen",
        Box::new(op_webview_set_fullscreen),
    );
    context.register_op("webview_loop", Box::new(op_webview_loop));
    context.register_op("webview_dispose", Box::new(op_webview_dispose));
}
init_fn!(init);

fn op_webview_new(data: &[u8], _zero_copy: Option<ZeroCopyBuf>) -> CoreOp {
    unsafe {
        if CWEBVIEW.is_some() {
            return Op::Sync(Box::new([false as u8]));
        }

        let args: NewArgs = serde_json::from_slice(data).unwrap();

        let title = CString::new(args.title).unwrap();
        let url = CString::new(args.url).unwrap();
        let width = args.width;
        let height = args.height;
        let resizable = args.resizable as i32;
        let debug = args.debug as i32;

        CWEBVIEW = Some(webview_new(
            title.as_ptr(),
            url.as_ptr(),
            width,
            height,
            resizable,
            debug,
            None,
            null_mut(),
        ));

        Op::Sync(Box::new([true as u8]))
    }
}

fn op_webview_exit(_data: &[u8], _zero_copy: Option<ZeroCopyBuf>) -> CoreOp {
    unsafe {
        if CWEBVIEW.is_none() {
            return Op::Sync(Box::new([false as u8]));
        }

        webview_exit(CWEBVIEW.unwrap());

        Op::Sync(Box::new([true as u8]))
    }
}

fn op_webview_eval(data: &[u8], _zero_copy: Option<ZeroCopyBuf>) -> CoreOp {
    unsafe {
        if CWEBVIEW.is_none() {
            return Op::Sync(Box::new([false as u8]));
        }

        let args: EvalArgs = serde_json::from_slice(data).unwrap();
        let js = CString::new(args.js).unwrap();

        webview_eval(CWEBVIEW.unwrap(), js.as_ptr());

        Op::Sync(Box::new([true as u8]))
    }
}

fn op_webview_inject_css(data: &[u8], _zero_copy: Option<ZeroCopyBuf>) -> CoreOp {
    unsafe {
        if CWEBVIEW.is_none() {
            return Op::Sync(Box::new([false as u8]));
        }

        let args: InjectCssArgs = serde_json::from_slice(data).unwrap();
        let css = CString::new(args.css).unwrap();

        webview_inject_css(CWEBVIEW.unwrap(), css.as_ptr());

        Op::Sync(Box::new([true as u8]))
    }
}

fn op_webview_set_color(data: &[u8], _zero_copy: Option<ZeroCopyBuf>) -> CoreOp {
    unsafe {
        if CWEBVIEW.is_none() {
            return Op::Sync(Box::new([false as u8]));
        }

        let args: SetColorArgs = serde_json::from_slice(data).unwrap();

        webview_set_color(CWEBVIEW.unwrap(), args.r, args.g, args.b, args.a);

        Op::Sync(Box::new([true as u8]))
    }
}

fn op_webview_set_title(data: &[u8], _zero_copy: Option<ZeroCopyBuf>) -> CoreOp {
    unsafe {
        if CWEBVIEW.is_none() {
            return Op::Sync(Box::new([false as u8]));
        }

        let args: SetTitleArgs = serde_json::from_slice(data).unwrap();
        let title = CString::new(args.title).unwrap();

        webview_set_title(CWEBVIEW.unwrap(), title.as_ptr());

        Op::Sync(Box::new([true as u8]))
    }
}

fn op_webview_set_fullscreen(data: &[u8], _zero_copy: Option<ZeroCopyBuf>) -> CoreOp {
    unsafe {
        if CWEBVIEW.is_none() {
            return Op::Sync(Box::new([false as u8]));
        }

        let args: SetFullscreenArgs = serde_json::from_slice(data).unwrap();
        let fullscreen = args.fullscreen as i32;

        webview_set_fullscreen(CWEBVIEW.unwrap(), fullscreen);

        Op::Sync(Box::new([true as u8]))
    }
}

fn op_webview_loop(data: &[u8], _zero_copy: Option<ZeroCopyBuf>) -> CoreOp {
    unsafe {
        if CWEBVIEW.is_none() {
            return Op::Sync(Box::new([false as u8]));
        }

        let args: LoopArgs = serde_json::from_slice(data).unwrap();
        let result = webview_loop(CWEBVIEW.unwrap(), args.blocking);

        Op::Sync(Box::new(result.to_be_bytes()))
    }
}

fn op_webview_dispose(_data: &[u8], _zero_copy: Option<ZeroCopyBuf>) -> CoreOp {
    unsafe {
        if CWEBVIEW.is_none() {
            return Op::Sync(Box::new([false as u8]));
        }
        webview_free(CWEBVIEW.unwrap());
        CWEBVIEW = None;

        Op::Sync(Box::new([true as u8]))
    }
}
