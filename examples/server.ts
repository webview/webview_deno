import { serve } from "https://deno.land/std@0.79.0/http/mod.ts";
import { Webview } from "../mod.ts";

const webview = new Webview();
webview.navigate(`http://localhost:8080`);

const server = serve({ port: 8080 });
for await (const req of server) {
  req.respond({ body: "Hello World" });
}

webview.run();
