import * as Plugin from "./plugin.ts";

/**
 * A WebView instance
 */
export class WebView {
    constructor(args: {
        title?: string;
        url?: string;
        width?: number;
        height?: number;
        resizable?: boolean;
        debug?: boolean;
    }) {
        args = Object.assign(
            {
                title: "deno_webview",
                url: "about:blank",
                width: 800,
                height: 600,
                resizable: true,
                debug: true
            },
            args
        );

        if (!Plugin.webviewNew(args as Plugin.NewArgs))
            throw "Cannot create multiple WebView instances";
    }

    private Uint8ArrayToNumber(data: Uint8Array): number {
        return (
            (data[3] << 0) | (data[2] << 8) | (data[1] << 16) | (data[0] << 24)
        );
    }

    /**
     * Runs the event loop to completion
     */
    public run() {
        while (this.step()) {}
    }

    /**
     * Iterates the event loop and returns `false` if the the `WebView` has been closed
     */
    public step(): boolean {
        return (
            this.Uint8ArrayToNumber(
                Plugin.webviewLoop({
                    blocking: 1
                })
            ) === 0
        );
    }

    /**
     * Exits the `WebView`
     */
    public exit(): boolean {
        return Plugin.webviewExit();
    }

    /**
     * Evaluates the provided js code in the `WebView`
     */
    public eval(js: string): boolean {
        return Plugin.webviewEval({
            js: js
        });
    }

    /**
     * Injects the provided css into the `WebView`
     */
    public injectCss(css: string): boolean {
        return Plugin.webviewInjectCss({
            css: css
        });
    }

    /**
     * Sets the color of the title bar
     */
    public setColor(color: Plugin.SetColorArgs): boolean {
        return Plugin.webviewSetColor(color);
    }

    /**
     * Sets the window title
     */
    public setTitle(title: string): boolean {
        return Plugin.webviewSetTitle({
            title: title
        });
    }

    /**
     * Enables or disables fullscreen
     */
    public setFullscreen(fullscreen: boolean): boolean {
        return Plugin.webviewSetFullscreen({
            fullscreen: fullscreen
        });
    }

    /**
     * Disposes this `WebView` instance for creating a new `WebView` instance
     */
    public dispose() {
        return Plugin.webviewDispose();
    }
}
