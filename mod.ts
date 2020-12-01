export * from "./webview.ts";

import { load, unload } from "./plugin.ts";

await load();

// deno-lint-ignore ban-ts-comment
// @ts-ignore
if (typeof window !== "undefined") window.addEventListener("unload", unload);
