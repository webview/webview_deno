import { Plug } from "./deps.ts";

const VERSION = "0.6.0-pre.0";
const POLICY = Deno.env.get("PLUGIN_URL") === undefined
  ? Plug.CachePolicy.STORE
  : Plug.CachePolicy.NONE;
const PLUGIN_URL = Deno.env.get("PLUGIN_URL") ??
  `https://github.com/webview/webview_deno/releases/download/${VERSION}/`;

await Plug.prepare({
  name: "webview_deno",
  url: PLUGIN_URL,
  policy: POLICY,
});
