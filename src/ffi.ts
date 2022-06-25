import { CachePolicy, download, join, prepare } from "../deps.ts";
import { Webview } from "./webview.ts";

const version = "0.7.3";
const policy = Deno.env.get("PLUGIN_URL") === undefined
  ? CachePolicy.STORE
  : CachePolicy.NONE;
let url = Deno.env.get("PLUGIN_URL") ??
  `https://github.com/webview/webview_deno/releases/download/${version}/`;

/**
 * Checks for the existence of `./WebView2Loader.dll` for running on Windows.
 *
 * @returns true if it exists, false if it doesn't
 */
async function checkForWebView2Loader(): Promise<boolean> {
  return await Deno.stat("./WebView2Loader.dll").then(
    () => true,
    (e) => e instanceof Deno.errors.NotFound ? false : true,
  );
}

// make sure we don't preload twice
let preloaded = false;

/**
 * All active webview instances. This is internally used for automatically
 * destroying all instances once {@link unload} is called.
 */
export const instances: Webview[] = [];

/**
 * Loads the `./WebView2Loader.dll` for running on Windows. Removes old version
 * if it already existed, and only runs once. Should be run on the main thread
 * so that the `unload` gets hooked in properly, otherwise make sure `unload`
 * gets called during the `window.onunload` event (after all windows are
 * closed).
 *
 * Does not need to be run on non-windows platforms, but that is subject to change.
 */
export async function preload() {
  if (preloaded) return;

  if (Deno.build.os === "windows") {
    if (await checkForWebView2Loader()) {
      await Deno.remove("./WebView2Loader.dll");
    }

    const webview2loader = await download(`${url}WebView2Loader.dll`);
    await Deno.copyFile(webview2loader, "./WebView2Loader.dll");

    self.addEventListener("unload", unload);
  }

  preloaded = true;
}

/**
 * Unload the library and destroy all webview instances. Should only be run
 * once all windows are closed. If `preload` was called in the main thread,
 * this will automatically be called during the `window.onunload` event;
 * otherwise, you may have to call this manually.
 */
export function unload() {
  for (const instance of instances) {
    instance.destroy();
  }
  lib.close();
  if (Deno.build.os === "windows") {
    Deno.removeSync("./WebView2Loader.dll");
  }
}

// Automatically run the preload if we're on windows and on the main thread.
if (Deno.build.os === "windows") {
  if ((self as never)["window"]) {
    await preload();
  } else if (!await checkForWebView2Loader()) {
    throw new Error(
      "WebView2Loader.dll does not exist! Make sure to run preload() from the main thread.",
    );
  }
}

// Make sure to load the right dylib for the arch when on darwin
if (Deno.build.os === "darwin" && !url.endsWith("dylib")) {
  url = join(url, `libwebview.${Deno.build.arch}.dylib`);
}

const lib = await prepare(
  {
    name: "webview",
    url,
    policy,
  },
  {
    "webview_create": {
      parameters: ["i32", "pointer"],
      result: "pointer",
    },
    "webview_destroy": {
      parameters: ["pointer"],
      result: "void",
    },
    "webview_run": {
      parameters: ["pointer"],
      result: "void",
    },
    "webview_terminate": {
      parameters: ["pointer"],
      result: "void",
    },
    // "webview_dispatch": {
    //   parameters: ["pointer", { function: { parameters: ["pointer", "pointer"], result: "void" } }, "pointer"],
    //   result: "void",
    // },
    "webview_get_window": {
      parameters: ["pointer"],
      result: "pointer",
    },
    "webview_set_title": {
      parameters: ["pointer", "pointer"],
      result: "void",
    },
    "webview_set_size": {
      parameters: ["pointer", "i32", "i32", "i32"],
      result: "void",
    },
    "webview_navigate": {
      parameters: ["pointer", "pointer"],
      result: "void",
    },
    "webview_set_html": {
      parameters: ["pointer", "pointer"],
      result: "void",
    },
    "webview_init": {
      parameters: ["pointer", "pointer"],
      result: "void",
    },
    "webview_eval": {
      parameters: ["pointer", "pointer"],
      result: "void",
    },
    "webview_bind": {
      parameters: ["pointer", "pointer", "function", "pointer"],
      result: "void",
    },
    "webview_unbind": {
      parameters: ["pointer", "pointer"],
      result: "void",
    },
    "webview_return": {
      parameters: ["pointer", "pointer", "i32", "pointer"],
      result: "void",
    },
  } as const,
);

export default lib;
