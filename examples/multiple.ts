import { Webview } from "../mod.ts";

const webview1 = new Webview({ url: "https://deno.land" });
const webview2 = new Webview({ url: "https://wikipedia.org" });
await Promise.all([webview1.run(), webview2.run()]);
