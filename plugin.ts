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

export interface ExitAndDisposeArgs {
    id: number;
}

export interface EvalArgs {
    id: number;

    js: string;
}

export interface InjectCssArgs {
    id: number;

    css: string;
}

export interface SetColorArgs {
    id: number;

    r: number;
    g: number;
    b: number;
    a: number;
}

export interface SetTitleArgs {
    id: number;

    title: String;
}

export interface SetFullscreenArgs {
    id: number;

    fullscreen: boolean;
}

export interface LoopArgs {
    id: number;

    blocking: number;
}

export function webviewNew(args: NewArgs): number {
    let result = plugin.ops.webview_new.dispatch(
        encoder.encode(JSON.stringify(args))
    )!;
    return Uint8ArrayToNumber(result);
}

export function webviewExit(args: ExitAndDisposeArgs): boolean {
    let result = plugin.ops.webview_exit.dispatch(
        encoder.encode(JSON.stringify(args))
    );
    return result![0] !== 0;
}

export function webviewEval(args: EvalArgs): boolean {
    let result = plugin.ops.webview_eval.dispatch(
        encoder.encode(JSON.stringify(args))
    );
    return result![0] !== 0;
}

export function webviewInjectCss(args: InjectCssArgs): boolean {
    let result = plugin.ops.webview_inject_css.dispatch(
        encoder.encode(JSON.stringify(args))
    );
    return result![0] !== 0;
}

export function webviewSetColor(args: SetColorArgs): boolean {
    let result = plugin.ops.webview_set_color.dispatch(
        encoder.encode(JSON.stringify(args))
    );
    return result![0] !== 0;
}

export function webviewSetTitle(args: SetTitleArgs): boolean {
    let result = plugin.ops.webview_set_title.dispatch(
        encoder.encode(JSON.stringify(args))
    );
    return result![0] !== 0;
}

export function webviewSetFullscreen(args: SetFullscreenArgs): boolean {
    let result = plugin.ops.webview_set_fullscreen.dispatch(
        encoder.encode(JSON.stringify(args))
    );
    return result![0] !== 0;
}

export function webviewLoop(args: LoopArgs): number {
    let result = plugin.ops.webview_loop.dispatch(
        encoder.encode(JSON.stringify(args))
    )!;
    return Uint8ArrayToNumber(result);
}

export function webviewDispose(args: ExitAndDisposeArgs): boolean {
    let result = plugin.ops.webview_dispose.dispatch(
        encoder.encode(JSON.stringify(args))
    );
    return result![0] !== 0;
}
