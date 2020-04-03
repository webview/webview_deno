import { WebView } from "../mod.ts";

await new WebView({
  title: "Remote deno_webview example",
  url: `https://en.wikipedia.org/wiki/Main_Page`,
  width: 800,
  height: 600,
  resizable: true,
  debug: true,
  frameless: false,
}).run();
