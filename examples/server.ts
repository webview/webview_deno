import { serve } from "https://deno.land/std@0.120.0/http/mod.ts";
import { Webview } from "../mod.ts";

const _server = serve(() =>
  new Response("<h1>Hello World</h1>", {
    headers: new Headers({
      "content-type": "text/html",
    }),
  }), { port: 8080 });

const webview = new Webview();

webview.navigate(`http://localhost:8080`);

// FIXME: Blocks the main thread and
// no further requests can be served.
webview.run();
