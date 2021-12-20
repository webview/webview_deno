import { Webview } from "../mod.ts";

const webview = new Webview();
webview.navigate("https://deno.land/");
webview.run();
