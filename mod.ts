import { prepare } from "https://deno.land/x/plugin_prepare/mod.ts";

const releaseUrl =
    "https://github.com/eliassjogreen/deno_webview/releases/download/0.0.1";

const plugin = await prepare({
    name: "deno_webview",
    urls: {
        mac: `${releaseUrl}/libdeno_webview.dylib`,
        win: `${releaseUrl}/deno_webview.dll`,
        linux: `${releaseUrl}/libdeno_webview.so`
    }
});

interface NewArgs {
    title: string;
    url: string;
    width: number;
    height: number;
    resizable: boolean;
    debug: boolean;
}

interface EvalArgs {
    js: string;
}

interface InjectCssArgs {
    css: string;
}

interface SetColorArgs {
    r: number;
    g: number;
    b: number;
    a: number;
}

interface SetTitleArgs {
    title: String;
}

interface SetFullscreenArgs {
    fullscreen: boolean;
}

interface LoopArgs {
    blocking: number;
}
