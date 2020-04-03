import { prepare } from "https://deno.land/x/plugin_prepare@v0.3.1/mod.ts";

const DEV = Deno.env("DEV");
const MSHTML = Deno.env("MSHTML");

const pluginPath = DEV !== undefined
  ? DEV
  : "https://github.com/eliassjogreen/deno_webview/releases/download/0.3.1";

const plugin = await prepare({
  name: "deno_webview",
  checkCache: DEV === undefined,
  urls: {
    mac: `${pluginPath}/libdeno_webview.dylib`,
    win: MSHTML === undefined ? `${pluginPath}/deno_webview.dll` : MSHTML,
    linux: `${pluginPath}/libdeno_webview.so`,
  },
});

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function jsonOpSync<P extends Object, R extends WebViewResponse<any>>(
  op: Deno.PluginOp,
  params: P,
): R {
  let raw = op.dispatch(encoder.encode(JSON.stringify(params)));

  if (!raw) {
    throw `Plugin op ${op} returned null`;
  }

  return JSON.parse(decoder.decode(raw)) as R;
}

async function jsonOpAsync<P extends Object, R extends WebViewResponse<any>>(
  op: Deno.PluginOp,
  params: P,
): Promise<R> {
  return new Promise((resolve, reject) => {
    op.setAsyncHandler((raw) => {
      if (!raw) {
        throw `Plugin op ${op} returned null`;
      }

      resolve(unwrapResponse(JSON.parse(decoder.decode(raw))));
    });

    op.dispatch(encoder.encode(JSON.stringify(params)));
  });
}

function unwrapResponse<T, R extends WebViewResponse<T>>(response: R): T {
  if (response.err) {
    throw response.err;
  }

  if (response.ok) {
    return response.ok;
  }

  throw "Invalid response";
}

export interface WebViewResponse<T> {
  err?: string;
  ok?: T;
}

export interface WebViewNewParams {
  title: string;
  url: string;
  width: number;
  height: number;
  resizable: boolean;
  debug: boolean;
  frameless: boolean;
}

export interface WebViewNewResult {
  id: number;
}

export interface WebViewExitParams {
  id: number;
}

export interface WebViewExitResult {}

export interface WebViewEvalParams {
  id: number;
  js: string;
}

export interface WebViewEvalResult {}

export interface WebViewSetColorParams {
  id: number;
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface WebViewSetColorResult {}

export interface WebViewSetTitleParams {
  id: number;
  title: String;
}

export interface WebViewSetTitleResult {}

export interface WebViewSetFullscreenParams {
  id: number;
  fullscreen: boolean;
}

export interface WebViewSetFullscreenResult {}

export interface WebViewLoopParams {
  id: number;
  blocking: number;
}

export interface WebViewLoopResult {
  code: number;
}

export interface WebViewRunParams {
  id: number;
}

export interface WebViewRunResult {}

export function WebViewNew(params: WebViewNewParams): WebViewNewResult {
  return unwrapResponse(jsonOpSync(plugin.ops.webview_new, params));
}

export function WebViewExit(params: WebViewExitParams): WebViewExitResult {
  return unwrapResponse(jsonOpSync(plugin.ops.webview_exit, params));
}

export function WebViewEval(params: WebViewEvalParams): WebViewEvalResult {
  return unwrapResponse(jsonOpSync(plugin.ops.webview_eval, params));
}

export function WebViewSetColor(
  params: WebViewSetColorParams,
): WebViewSetColorResult {
  return unwrapResponse(jsonOpSync(plugin.ops.webview_set_color, params));
}

export function WebViewSetTitle(
  params: WebViewSetTitleParams,
): WebViewSetTitleResult {
  return unwrapResponse(jsonOpSync(plugin.ops.webview_set_title, params));
}

export function WebViewSetFullscreen(
  params: WebViewSetFullscreenParams,
): WebViewSetFullscreenResult {
  return unwrapResponse(
    jsonOpSync(plugin.ops.webview_set_fullscreen, params),
  );
}

export function WebViewLoop(params: WebViewLoopParams): WebViewLoopResult {
  return unwrapResponse(jsonOpSync(plugin.ops.webview_loop, params));
}

export function WebViewRun(params: WebViewRunParams): Promise<
  WebViewRunResult
> {
  return jsonOpAsync(plugin.ops.webview_run, params);
}
