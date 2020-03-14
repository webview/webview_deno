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
    context.register_op("webview_inject_css", Box::new(op_webview_inject_css));
    context.register_op("webview_set_color", Box::new(op_webview_set_color));
    context.register_op("webview_set_title", Box::new(op_webview_set_title));
    context.register_op(
        "webview_set_fullscreen",
        Box::new(op_webview_set_fullscreen),
    );
    context.register_op("webview_loop", Box::new(op_webview_loop));
}
init_fn!(init);

#[derive(Serialize, Deserialize)]
struct NewArgs {
    title: String,
    url: String,
    width: i32,
    height: i32,
    resizable: bool,
    debug: bool,
    frameless: bool,
}

fn op_webview_new(data: &[u8], _zero_copy: Option<ZeroCopyBuf>) -> CoreOp {
    unsafe {
        let args: NewArgs = serde_json::from_slice(data).unwrap();

        let mut instance_id: u32 = 0;
        INSTANCE_INDEX.with(|cell| {
            instance_id = cell.replace_with(|&mut i| i + 1);
        });

        INSTANCE_MAP.with(|cell| {
            cell.borrow_mut().insert(
                instance_id,
                webview_new(
                    CString::new(args.title).unwrap().as_ptr(),
                    CString::new(args.url).unwrap().as_ptr(),
                    args.width,
                    args.height,
                    args.resizable as i32,
                    args.debug as i32,
                    args.frameless as i32,
                    None,
                    null_mut(),
                ),
            );
        });

        Op::Sync(Box::new(instance_id.to_be_bytes()))
    }
}

#[derive(Serialize, Deserialize)]
struct ExitArgs {
    id: u32,
}

fn op_webview_exit(data: &[u8], _zero_copy: Option<ZeroCopyBuf>) -> CoreOp {
    unsafe {
        INSTANCE_MAP.with(|cell| {
            let args: ExitArgs = serde_json::from_slice(data).unwrap();
            let instance = *cell.borrow_mut().get(&args.id).unwrap();

            webview_exit(instance);
        });

        Op::Sync(Box::new([true as u8]))
    }
}

#[derive(Serialize, Deserialize)]
struct EvalArgs {
    id: u32,
    js: String,
}

fn op_webview_eval(data: &[u8], _zero_copy: Option<ZeroCopyBuf>) -> CoreOp {
    unsafe {
        INSTANCE_MAP.with(|cell| {
            let args: EvalArgs = serde_json::from_slice(data).unwrap();
            let instance = *cell.borrow_mut().get(&args.id).unwrap();

            webview_eval(instance, CString::new(args.js).unwrap().as_ptr());
        });

        Op::Sync(Box::new([true as u8]))
    }
}

#[derive(Serialize, Deserialize)]
struct InjectCssArgs {
    id: u32,
    css: String,
}

fn op_webview_inject_css(data: &[u8], _zero_copy: Option<ZeroCopyBuf>) -> CoreOp {
    unsafe {
        INSTANCE_MAP.with(|cell| {
            let args: InjectCssArgs = serde_json::from_slice(data).unwrap();
            let instance = *cell.borrow_mut().get(&args.id).unwrap();

            webview_inject_css(instance, CString::new(args.css).unwrap().as_ptr());
        });

        Op::Sync(Box::new([true as u8]))
    }
}

#[derive(Serialize, Deserialize)]
struct SetColorArgs {
    id: u32,
    r: u8,
    g: u8,
    b: u8,
    a: u8,
}

fn op_webview_set_color(data: &[u8], _zero_copy: Option<ZeroCopyBuf>) -> CoreOp {
    unsafe {
        INSTANCE_MAP.with(|cell| {
            let args: SetColorArgs = serde_json::from_slice(data).unwrap();
            let instance = *cell.borrow_mut().get(&args.id).unwrap();

            webview_set_color(instance, args.r, args.g, args.b, args.a);
        });

        Op::Sync(Box::new([true as u8]))
    }
}

#[derive(Serialize, Deserialize)]
struct SetTitleArgs {
    id: u32,
    title: String,
}

fn op_webview_set_title(data: &[u8], _zero_copy: Option<ZeroCopyBuf>) -> CoreOp {
    unsafe {
        INSTANCE_MAP.with(|cell| {
            let args: SetTitleArgs = serde_json::from_slice(data).unwrap();
            let instance = *cell.borrow_mut().get(&args.id).unwrap();

            webview_set_title(instance, CString::new(args.title).unwrap().as_ptr());
        });

        Op::Sync(Box::new([true as u8]))
    }
}

#[derive(Serialize, Deserialize)]
struct SetFullscreenArgs {
    id: u32,
    fullscreen: bool,
}

fn op_webview_set_fullscreen(data: &[u8], _zero_copy: Option<ZeroCopyBuf>) -> CoreOp {
    unsafe {
        INSTANCE_MAP.with(|cell| {
            let args: SetFullscreenArgs = serde_json::from_slice(data).unwrap();
            let instance = *cell.borrow_mut().get(&args.id).unwrap();

            webview_set_fullscreen(instance, args.fullscreen as i32);
        });

        Op::Sync(Box::new([true as u8]))
    }
}

#[derive(Serialize, Deserialize)]
struct LoopArgs {
    id: u32,
    blocking: i32,
}

fn op_webview_loop(data: &[u8], _zero_copy: Option<ZeroCopyBuf>) -> CoreOp {
    unsafe {
        let mut result: i32 = 0;

        INSTANCE_MAP.with(|cell| {
            let args: LoopArgs = serde_json::from_slice(data).unwrap();
            let instance = *cell.borrow_mut().get(&args.id).unwrap();

            result = webview_loop(instance, args.blocking);
        });

        Op::Sync(Box::new(result.to_be_bytes()))
    }
}
