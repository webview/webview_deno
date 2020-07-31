import { Plug, deferred } from "./deps.ts";

const VERSION = "0.4.5";

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

function opSync<R extends WebviewResponse<any>>(op: string, data: object): R {
  if (pluginId === null) {
    throw "The plugin must be initialized before use";
  }

  const opId = Plug.getOpId(op);
  const response = Plug.core.dispatch(opId, encode(data))!;

  return decode(response) as R;
}

async function opAsync<R extends WebviewResponse<any>>(
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

function unwrapResponse<T, R extends WebviewResponse<T>>(response: R): T {
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

export interface WebviewResponse<T> {
  err?: string;
  ok?: T;
}

export interface WebviewEmptyResult {}

export interface WebviewCreateResult {
  id: number;
}

export interface WebviewIdParams {
  id: number;
}

export interface WebviewCreateParams {
  debug: boolean;
}

export interface WebviewJsParams {
  id: number;
  js: string;
}

export interface WebviewUrlParams {
  id: number;
  url: string;
}

export interface WebviewSetSizeParams {
  id: number;
  width: number;
  height: number;
  hint: number;
}

export interface WebviewSetTitleParams {
  id: number;
  title: string;
}

export function WebviewCreate(
  params: WebviewCreateParams,
): WebviewCreateResult {
  return unwrapResponse(opSync("webview_create", params));
}

export function WebviewDestroy(params: WebviewIdParams): void {
  unwrapResponse(opSync("webview_destroy", params));
}

export function WebviewTerminate(params: WebviewIdParams): void {
  unwrapResponse(opSync("webview_terminate", params));
}

export function WebviewSetTitle(params: WebviewSetTitleParams): void {
  unwrapResponse(opSync("webview_set_title", params));
}

export function WebviewSetSize(params: WebviewSetSizeParams): void {
  unwrapResponse(opSync("webview_set_size", params));
}

export function WebviewEval(params: WebviewJsParams): void {
  unwrapResponse(opSync("webview_eval", params));
}

export function WebviewInit(params: WebviewJsParams): void {
  unwrapResponse(opSync("webview_init", params));
}

export function WebviewNavigate(params: WebviewUrlParams): void {
  unwrapResponse(opSync("webview_navigate", params));
}

export async function WebviewRun(params: WebviewIdParams): Promise<void> {
  return unwrapResponse(await opAsync("webview_run", params));
}

await load(!DEBUG);

//@ts-ignore
if (typeof window !== "undefined") window.addEventListener("unload", unload);
