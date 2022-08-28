import { serve } from "https://deno.land/std@0.153.0/http/server.ts";
import { Webview } from "../mod.ts";

const controller = new AbortController();
const server = serve(() =>
  new Response("<h1>Hello World</h1>", {
    headers: new Headers({
      "content-type": "text/html",
    }),
  }), { port: 8080, signal: controller.signal });

const webview = new Webview();

webview.navigate(`http://localhost:8080`);

webview.run();
controller.abort();
await server;
