import * as Plugin from "./plugin.ts";

export class WebView {
    constructor(args: {
        title?: string;
        url?: string;
        width?: number;
        height?: number;
        resizable?: boolean;
        debug?: boolean;
    }) {
        args = Object.assign({
            title: "deno_webview",
            url: "about:blank",
            width: 800,
            height: 600,
            resizable: true,
            debug: true
        }, args);

        if (!Plugin.webviewNew(args as Plugin.NewArgs))
            throw "Cannot create multiple WebView instances";
    }

    private Uint8ArrayToNumber(data: Uint8Array): number {
        return (
            (data[3] << 0) | (data[2] << 8) | (data[1] << 16) | (data[0] << 24)
        );
    }

    public run() {
        while (this.step()) {}
    }

    public step(): boolean {
        return (
            this.Uint8ArrayToNumber(
                Plugin.webviewLoop({
                    blocking: 1
                })
            ) === 0
        );
    }

    public exit(): boolean {
        return Plugin.webviewExit();
    }

    public eval(js: string): boolean {
        return Plugin.webviewEval({
            js: js
        });
    }

    public injectCss(css: string): boolean {
        return Plugin.webviewInjectCss({
            css: css
        });
    }

    public setColor(color: Plugin.SetColorArgs): boolean {
        return Plugin.webviewSetColor(color);
    }

    public setTitle(title: string): boolean {
        return Plugin.webviewSetTitle({
            title: title
        });
    }

    public setFullscreen(fullscreen: boolean): boolean {
        return Plugin.webviewSetFullscreen({
            fullscreen: fullscreen
        });
    }

    public dispose() {
        return Plugin.webviewDispose();
    }
}
