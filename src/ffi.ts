import manifest from "../deno.json" with { type: "json" };

import { dlopen, download } from "@denosaurs/plug";
import type { Webview } from "./webview.ts";

const version = manifest.version;
const cache = Deno.env.get("PLUGIN_URL") === undefined ? "use" : "reloadAll";
const url = Deno.env.get("PLUGIN_URL") ??
  `https://github.com/webview/webview_deno/releases/download/${version}/`;

const encoder = new TextEncoder();

/**
 * Encodes a string to a null terminated string
 *
 * @param value The intput string
 * @returns A null terminated `Uint8Array` of the input string
 */
export function encodeCString(value: string) {
  return encoder.encode(value + "\0");
}

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

    const webview2loader = await download({
      url: `${url}/WebView2Loader.dll`,
      cache,
    });
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
  if (self === globalThis) {
    await preload();
  } else if (!await checkForWebView2Loader()) {
    throw new Error(
      "WebView2Loader.dll does not exist! Make sure to run preload() from the main thread.",
    );
  }
}

export const lib = await dlopen(
  {
    name: "webview",
    url,
    cache,
    suffixes: {
      darwin: `.${Deno.build.arch}`,
    },
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
      parameters: ["pointer", "buffer"],
      result: "void",
    },
    "webview_set_size": {
      parameters: ["pointer", "i32", "i32", "i32"],
      result: "void",
    },
    "webview_navigate": {
      parameters: ["pointer", "buffer"],
      result: "void",
    },
    "webview_set_html": {
      parameters: ["pointer", "pointer"],
      result: "void",
    },
    "webview_init": {
      parameters: ["pointer", "buffer"],
      result: "void",
    },
    "webview_eval": {
      parameters: ["pointer", "buffer"],
      result: "void",
    },
    "webview_bind": {
      parameters: ["pointer", "buffer", "function", "pointer"],
      result: "void",
    },
    "webview_unbind": {
      parameters: ["pointer", "buffer"],
      result: "void",
    },
    "webview_return": {
      parameters: ["pointer", "buffer", "i32", "buffer"],
      result: "void",
    },
  } as const,
);
