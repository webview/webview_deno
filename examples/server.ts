import { serve } from "https://deno.land/std@0.120.0/http/mod.ts";
import { Webview } from "../mod.ts";

const server = serve(() =>
  new Response("Hello World", {
    headers: new Headers({
      "content-type": "text/html",
    }),
  }), { port: 8080 });

const webview = new Webview();

webview.navigate(`http://localhost:8080`);

setTimeout(() => webview.run(), 1000);
