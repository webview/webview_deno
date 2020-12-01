import { Webview } from "../mod.ts";

const webview = new Webview({ url: "https://deno.land" });
await webview.run();
