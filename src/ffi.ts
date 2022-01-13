import { CachePolicy, prepare } from "../deps.ts";

const VERSION = "0.7.0";
const POLICY = Deno.env.get("PLUGIN_URL") === undefined
  ? CachePolicy.STORE
  : CachePolicy.NONE;
const PLUGIN_URL = Deno.env.get("PLUGIN_URL") ??
  `https://github.com/webview/webview_deno/releases/download/${VERSION}/`;

const url = Deno.env.get("DEV")
  ? (new URL("../target/debug", import.meta.url)).toString()
  : PLUGIN_URL;
const lib = await prepare({
  name: "webview_deno",
  url: url,
  policy: POLICY,
}, {
  "deno_webview_create": {
    parameters: ["i32", "pointer"],
    result: "pointer",
  },
  "deno_webview_destroy": {
    parameters: ["pointer"],
    result: "void",
  },
  "deno_webview_run": {
    parameters: ["pointer"],
    result: "void",
  },
  "deno_webview_terminate": {
    parameters: ["pointer"],
    result: "void",
  },
  "deno_webview_dispatch": {
    parameters: ["pointer", "pointer", "pointer"],
    result: "void",
  },
  "deno_webview_set_title": {
    parameters: ["pointer", "pointer"],
    result: "void",
  },
  "deno_webview_get_window": {
    parameters: ["pointer"],
    result: "pointer",
  },
  "deno_webview_set_size": {
    parameters: ["pointer", "i32", "i32", "i32"],
    result: "void",
  },
  "deno_webview_navigate": {
    parameters: ["pointer", "pointer"],
    result: "void",
  },
  "deno_webview_eval": {
    parameters: ["pointer", "pointer"],
    result: "void",
  },
  "deno_webview_init": {
    parameters: ["pointer", "pointer"],
    result: "void",
  },
  "deno_webview_bind": {
    parameters: ["pointer", "pointer"],
    result: "void",
  },
  "deno_webview_return": {
    parameters: ["pointer", "pointer", "i32", "pointer"],
    result: "void",
  },
  "deno_webview_get_recv": {
    parameters: [],
    result: "pointer",
    nonblocking: true,
  },
});

export default lib;
