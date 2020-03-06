import { prepare } from "https://deno.land/x/plugin_prepare/mod.ts";

export interface Options {
    title: string;
    width: number;
    height: number;
    resizable: boolean;
    debug: boolean;
    content: string;
}

export async function run(options: Options) {
    const releaseUrl =
        "https://github.com/eliassjogreen/deno_webview/releases/download/0.0.1";

    const deno_webview: Deno.Plugin = await prepare({
        name: "deno_webview",
        urls: {
            mac: `${releaseUrl}/libdeno_webview.dylib`,
            win: `${releaseUrl}/deno_webview.dll`,
            linux: `${releaseUrl}/libdeno_webview.so`
        }
    });

    const { webview_run } = deno_webview.ops;

    webview_run.dispatch(new TextEncoder().encode(JSON.stringify(options)));
}
