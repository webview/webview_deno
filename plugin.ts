import { deferred, Plug } from "./deps.ts";

const VERSION = "0.5.0";

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

function encode(data: unknown): Uint8Array {
  const text = JSON.stringify(data);
  return encoder.encode(text);
}

function sync<R extends Result<any>>(op: string, data: unknown): R {
  if (pluginId === null) {
    throw "The plugin must be initialized before use";
  }

  const opId = Plug.getOpId(op);
  const response = Plug.core.dispatch(opId, encode(data))!;

  return decode(response) as R;
}

async function async<R extends Result<any>>(
  op: string,
  data: unknown,
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

  if (response) {
    throw "Expected null response!";
  }

  return promise;
}

function unwrap<T, R extends Result<T>>(response: R): T {
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

export interface Result<T> {
  err?: string;
  ok?: T;
}

export function WebviewCreate(debug: boolean): number {
  return unwrap(sync("webview_create", debug));
}

export function WebviewDestroy(id: number): void {
  unwrap(sync("webview_destroy", id));
}

export function WebviewRun(id: number): void {
  unwrap(sync("webview_run", id));
}

export function WebviewTerminate(id: number): void {
  unwrap(sync("webview_terminate", id));
}

export function WebviewSetTitle(id: number, title: string): void {
  unwrap(sync("webview_set_title", [id, title]));
}

export function WebviewSetSize(
  id: number,
  width: number,
  height: number,
  hint: number,
): void {
  unwrap(sync("webview_set_size", [id, width, height, hint]));
}

export function WebviewNavigate(id: number, url: string): void {
  unwrap(sync("webview_navigate", [id, url]));
}

export function WebviewInit(id: number, js: string): void {
  unwrap(sync("webview_init", [id, js]));
}

export function WebviewEval(id: number, js: string): void {
  unwrap(sync("webview_eval", [id, js]));
}

await load(!DEBUG);

//@ts-ignore
if (typeof window !== "undefined") window.addEventListener("unload", unload);
