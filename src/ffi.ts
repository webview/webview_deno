import { dlopen } from "../deps.ts";
import { Webview } from "./webview.ts";

const version = "0.7.4";
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
if (Deno.build.os === 'windows') {
  //Download and cache `./WebView2Loader.dll`
  const { default: dll } = await import(`https://ejm.sh/${url}/WebView2Loader.dll?.json`, { assert: { type: 'json' } }) as { default: { b64: string } };
  const dataUrl = `data:application/octet-stream;base64,${dll.b64}`;
  const webview2loader = (await fetch(dataUrl)).body;

  //Overwrite local dll with the version specified in "url"
  try {
    const fsFile = await Deno.open('./WebView2Loader.dll', { create: true, write: true })
    await webview2loader?.pipeTo(fsFile.writable); //fsFile is closed by the stream
  } catch (e) {
    const entries = await (async () => {
      const array: Deno.DirEntry[] = []
      for await (const entry of Deno.readDir('.')) array.push(entry)
      return array
    })()
    //Check if error is only caused by process lock
    if (!entries.some(entry => entry.name === 'WebView2Loader.dll')) throw e
    /**
     * WebView2Loader.dll is already used
     * Do not crash to allow multiple execution at the same root
     * WebView2Loader.dll is correctly reùoved in unload()
     */
  }

  self.addEventListener("unload", unload);
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
    //Try to remove "./WebView2Loader.dll" if it exists
    Deno.remove("./WebView2Loader.dll").catch((e) => {
      if (e instanceof Deno.errors.NotFound) return;
      throw e;
    });
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

// Prevent memory leaks on uncaught promises errors
addEventListener('unhandledrejection', (e) => {
  unload();
  throw e;
})
