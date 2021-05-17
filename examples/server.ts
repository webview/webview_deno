import { serve } from "https://deno.land/std/http/mod.ts";
import { Webview } from "../mod.ts";

const webview = new Webview();
const promise = webview.run();

const server = serve({ port: 8080 });
webview.navigate("http://localhost:8080");

for await (const req of server) {
  req.respond({ body: "Hello World" });
}

await promise;
