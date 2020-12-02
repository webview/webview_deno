import { Plug } from "./deps.ts";

const VERSION = "0.5.3";
const PLUGIN_URL = Deno.env.get("PLUGIN_URL") ??
  `https://github.com/webview/webview_deno/releases/download/${VERSION}/`;
const DEBUG = Boolean(Deno.env.get("DEBUG"));

const encoder = new TextEncoder();
const decoder = new TextDecoder();

let rid: number | undefined;

function deserialize(text: string): unknown {
  return JSON.parse(
    text.replace(/([^\"]+\"\:\s*)(\d{16,})/g, '$1"$2n"'),
    (_, v) => {
      if (typeof v === "string" && /^\d{16,}n$/.test(v)) {
        v = BigInt(v.slice(0, -1));
      }

      return v;
    },
  );
}

function serialize(value: unknown, space?: number): string {
  return JSON.stringify(value, (_, v) => {
    if (typeof v === "bigint") {
      v = v.toString() + "n";
    }
    return v;
  }, space).replace(/(?:\")(\d{16,})(?:n\")/g, "$1");
}

function decode(data: Uint8Array): unknown {
  const text = decoder.decode(data);
  return deserialize(text);
}

function encode(data: unknown): Uint8Array {
  const text = serialize(data);
  return encoder.encode(text);
}

export type Result<T> = { err: string } | { ok: T };

export function sync<T>(op: string, data: unknown = {}): T {
  if (rid === undefined) {
    throw "The plugin must be initialized before use";
  }

  const opId = Plug.getOpId(op);
  const response = Plug.core.dispatch(opId, encode(data))!;

  return decode(response) as T;
}

export function unwrap<T>(result: Result<T>): T {
  if ("err" in result) {
    throw (result as { err: string }).err;
  }

  if ("ok" in result) {
    return (result as { ok: T }).ok;
  }

  throw `Invalid result (${JSON.stringify(result)})`;
}

/**
 * Loads the plugin
 */
export async function load(cache = !DEBUG) {
  unload();
  rid = await Plug.prepare({
    name: "webview_deno",
    url: PLUGIN_URL,
    policy: cache ? Plug.CachePolicy.STORE : Plug.CachePolicy.NONE,
  });
}

/**
 * Frees the plugin
 */
export function unload() {
  if (rid !== undefined) Deno.close(rid);
  rid = undefined;
}
