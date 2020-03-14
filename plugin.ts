import { prepare } from "https://deno.land/x/plugin_prepare@v0.3.0/mod.ts";

const DEV = Deno.env("DEV");

const pluginPath = DEV !== undefined
    ? DEV
    : "https://github.com/eliassjogreen/deno_webview/releases/download/0.1.2";

const plugin = await prepare({
    name: "deno_webview",
    checkCache: DEV !== undefined,
    urls: {
        mac: `${pluginPath}/libdeno_webview.dylib`,
        win: `${pluginPath}/deno_webview.dll`,
        linux: `${pluginPath}/libdeno_webview.so`
    }
});

const encoder = new TextEncoder();

function Uint8ArrayToNumber(data: Uint8Array): number {
    return (data[3] << 0) | (data[2] << 8) | (data[1] << 16) | (data[0] << 24);
}

export interface NewArgs {
    title: string;
    url: string;
    width: number;
    height: number;
    resizable: boolean;
    debug: boolean;
    frameless: boolean;
}

export function webviewNew(args: NewArgs): number {
    let result = plugin.ops.webview_new.dispatch(
        encoder.encode(JSON.stringify(args))
    )!;
    return Uint8ArrayToNumber(result);
}

export interface ExitArgs {
    id: number;
}

export function webviewExit(args: ExitArgs): boolean {
    let result = plugin.ops.webview_exit.dispatch(
        encoder.encode(JSON.stringify(args))
    );
    return result![0] !== 0;
}

export interface EvalArgs {
    id: number;
    js: string;
}

export function webviewEval(args: EvalArgs): boolean {
    let result = plugin.ops.webview_eval.dispatch(
        encoder.encode(JSON.stringify(args))
    );
    return result![0] !== 0;
}

export interface InjectCssArgs {
    id: number;

    css: string;
}

export function webviewInjectCss(args: InjectCssArgs): boolean {
    let result = plugin.ops.webview_inject_css.dispatch(
        encoder.encode(JSON.stringify(args))
    );
    return result![0] !== 0;
}

export interface SetColorArgs {
    id: number;
    r: number;
    g: number;
    b: number;
    a: number;
}

export function webviewSetColor(args: SetColorArgs): boolean {
    let result = plugin.ops.webview_set_color.dispatch(
        encoder.encode(JSON.stringify(args))
    );
    return result![0] !== 0;
}

export interface SetTitleArgs {
    id: number;
    title: String;
}

export function webviewSetTitle(args: SetTitleArgs): boolean {
    let result = plugin.ops.webview_set_title.dispatch(
        encoder.encode(JSON.stringify(args))
    );
    return result![0] !== 0;
}

export interface SetFullscreenArgs {
    id: number;
    fullscreen: boolean;
}

export function webviewSetFullscreen(args: SetFullscreenArgs): boolean {
    let result = plugin.ops.webview_set_fullscreen.dispatch(
        encoder.encode(JSON.stringify(args))
    );
    return result![0] !== 0;
}

export interface LoopArgs {
    id: number;
    blocking: number;
}

export function webviewLoop(args: LoopArgs): number {
    let result = plugin.ops.webview_loop.dispatch(
        encoder.encode(JSON.stringify(args))
    )!;
    return Uint8ArrayToNumber(result);
}
