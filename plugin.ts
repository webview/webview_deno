import { Cache, Plug } from "./deps.ts";

const VERSION = "0.6.0-pre.0";
const POLICY = Deno.env.get("PLUGIN_URL") === undefined
  ? Plug.CachePolicy.STORE
  : Plug.CachePolicy.NONE;
const PLUGIN_URL = Deno.env.get("PLUGIN_URL") ??
  `https://github.com/webview/webview_deno/releases/download/${VERSION}/`;
const WEBVIEW2LOADER = "WebView2Loader.dll";

if (Plug.os === "windows") {
  Cache.configure({ directory: Cache.options.directory });
  const plug = Cache.namespace("plug");
  const file = await plug.cache(
    `${PLUGIN_URL}${(PLUGIN_URL.endsWith("/") ? "" : "/")}${WEBVIEW2LOADER}`,
    POLICY === Plug.CachePolicy.NONE ? Cache.RELOAD_POLICY : undefined,
  );

  const local = new URL(WEBVIEW2LOADER, import.meta.url);
  await Deno.copyFile(file.path, local);
}

await Plug.prepare({
  name: "webview_deno",
  url: PLUGIN_URL,
  policy: POLICY,
});
