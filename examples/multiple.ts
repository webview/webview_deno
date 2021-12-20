import { Webview } from "../mod.ts";

const webview1 = new Webview();
webview1.navigate("https://deno.land/");

const webview2 = new Webview();
webview2.navigate("https://google.com/");

webview1.run();
webview2.run();
