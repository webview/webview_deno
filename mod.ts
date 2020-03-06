import { prepare } from "https://deno.land/x/plugin_prepare/mod.ts";

const releaseUrl =
    "https://github.com/eliassjogreen/deno_webview/releases/latest/download";

const deno_webview = await prepare({
    name: "deno_webview",
    urls: {
        mac: `${releaseUrl}/libdeno_webview.dylib`,
        win: `${releaseUrl}/deno_webview.dll`,
        linux: `${releaseUrl}/libdeno_webview.so`
    }
});

export interface Options {
    title: string;
    width: number;
    height: number;
    resizable: boolean;
    debug: boolean;
    content: string;
}

export function run(options: Options) {
    const { webview_run } = deno_webview.ops;

    webview_run(new TextEncoder().encode(JSON.stringify(options)));
}
