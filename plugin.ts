import { prepare } from "https://deno.land/x/plugin_prepare/mod.ts";

const releaseUrl =
    "https://github.com/eliassjogreen/deno_webview/releases/download/0.1.1";

const plugin = await prepare({
    name: "deno_webview",
    urls: {
        mac: `${releaseUrl}/libdeno_webview.dylib`,
        win: `${releaseUrl}/deno_webview.dll`,
        linux: `${releaseUrl}/libdeno_webview.so`
    }
});

const encoder = new TextEncoder();

export interface NewArgs {
    title: string;
    url: string;
    width: number;
    height: number;
    resizable: boolean;
    debug: boolean;
}

export interface EvalArgs {
    js: string;
}

export interface InjectCssArgs {
    css: string;
}

export interface SetColorArgs {
    r: number;
    g: number;
    b: number;
    a: number;
}

export interface SetTitleArgs {
    title: String;
}

export interface SetFullscreenArgs {
    fullscreen: boolean;
}

export interface LoopArgs {
    blocking: number;
}

export function webviewNew(args: NewArgs): boolean {
    let result = plugin.ops.webview_new.dispatch(encoder.encode(JSON.stringify(args)));
    return result![0] !== 0;
}

export function webviewExit(): boolean {
    let result = plugin.ops.webview_exit.dispatch(new Uint8Array(0));
    return result![0] !== 0;
}

export function webviewEval(args: EvalArgs): boolean {
    let result = plugin.ops.webview_eval.dispatch(encoder.encode(JSON.stringify(args)));
    return result![0] !== 0;
}

export function webviewInjectCss(args: InjectCssArgs): boolean {
    let result = plugin.ops.webview_inject_css.dispatch(encoder.encode(JSON.stringify(args)));
    return result![0] !== 0;
}

export function webviewSetColor(args: SetColorArgs): boolean {
    let result = plugin.ops.webview_set_color.dispatch(encoder.encode(JSON.stringify(args)));
    return result![0] !== 0;
}

export function webviewSetTitle(args: SetTitleArgs): boolean {
    let result = plugin.ops.webview_set_title.dispatch(encoder.encode(JSON.stringify(args)));
    return result![0] !== 0;
}

export function webviewSetFullscreen(args: SetFullscreenArgs): boolean {
    let result = plugin.ops.webview_set_fullscreen.dispatch(encoder.encode(JSON.stringify(args)));
    return result![0] !== 0;
}

export function webviewLoop(args: LoopArgs): Uint8Array {
    let result = plugin.ops.webview_loop.dispatch(encoder.encode(JSON.stringify(args)));
    return result!;
}

export function webviewDispose(): boolean {
    let result = plugin.ops.webview_dispose.dispatch(new Uint8Array(0));
    return result![0] !== 0;
}
