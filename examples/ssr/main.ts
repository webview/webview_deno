import { dirname, join } from "https://deno.land/std@0.153.0/path/mod.ts";
import { Webview } from "../../mod.ts";

const worker = new Worker(
  join(dirname(import.meta.url), "worker.tsx"),
  { type: "module" },
);

const webview = new Webview();
webview.navigate("http://localhost:8000/");

console.log("[runner] worker started");
webview.run();
worker.terminate();
