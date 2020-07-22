import { Plug, deferred } from "./deps.ts";

const VERSION = "0.4.4";

export const PLUGIN_URL_BASE = Deno.env.get("WEBVIEW_DENO_PLUGIN_BASE") ||
  `https://github.com/webview/webview_deno/releases/download/${VERSION}/`;
const PLUGIN_URL = Deno.env.get("WEBVIEW_DENO_PLUGIN");
const DEBUG = Boolean(Deno.env.get("WEBVIEW_DENO_DEBUG"));

let pluginId: number | null = null;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function decode(data: Uint8Array): object {
  const text = decoder.decode(data);
  return JSON.parse(text);
}

function encode(data: object): Uint8Array {
  const text = JSON.stringify(data);
  return encoder.encode(text);
}

function opSync<R extends WebViewResponse<any>>(op: string, data: object): R {
  if (pluginId === null) {
    throw "The plugin must be initialized before use";
  }

  const opId = Plug.getOpId(op);
  const response = Plug.core.dispatch(opId, encode(data))!;

  return decode(response) as R;
}

async function opAsync<R extends WebViewResponse<any>>(
  op: string,
  data: object,
): Promise<R> {
  if (pluginId === null) {
    throw "The plugin must be initialized before use";
  }

  const opId = Plug.getOpId(op);
  const promise = deferred<R>();

  Plug.core.setAsyncHandler(
    opId,
    (response) => promise.resolve(decode(response) as R),
  );

  const response = Plug.core.dispatch(opId, encode(data));

  if (response != null || response != undefined) {
    throw "Expected null response!";
  }

  return promise;
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

/**
 * Load the plugin
 */
export async function load(cache: boolean) {
  unload();
  pluginId = await Plug.prepare({
    name: "webview_deno",
    url: PLUGIN_URL ?? PLUGIN_URL_BASE,
    policy: cache ? Plug.CachePolicy.STORE : Plug.CachePolicy.NONE,
  });
}

/**
 * Free the plugin resource
 */
export function unload(): void {
  if (pluginId !== null) Deno.close(pluginId);
  pluginId = null;
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
  return unwrapResponse(opSync("webview_new", params));
}

export function WebViewExit(params: WebViewExitParams): WebViewExitResult {
  return unwrapResponse(opSync("webview_exit", params));
}

export function WebViewEval(params: WebViewEvalParams): WebViewEvalResult {
  return unwrapResponse(opSync("webview_eval", params));
}

export function WebViewSetColor(
  params: WebViewSetColorParams,
): WebViewSetColorResult {
  return unwrapResponse(opSync("webview_set_color", params));
}

export function WebViewSetTitle(
  params: WebViewSetTitleParams,
): WebViewSetTitleResult {
  return unwrapResponse(opSync("webview_set_title", params));
}

export function WebViewSetFullscreen(
  params: WebViewSetFullscreenParams,
): WebViewSetFullscreenResult {
  return unwrapResponse(
    opSync("webview_set_fullscreen", params),
  );
}

export function WebViewLoop(params: WebViewLoopParams): WebViewLoopResult {
  return unwrapResponse(opSync("webview_loop", params));
}

export async function WebViewRun(params: WebViewRunParams): Promise<
  WebViewRunResult
> {
  return unwrapResponse(await opAsync("webview_run", params));
}

await load(!DEBUG);

//@ts-ignore
if (typeof window !== "undefined") window.addEventListener("unload", unload);
