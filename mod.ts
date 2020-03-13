import * as Plugin from "./plugin.ts";

/**
 * A WebView instance
 */
export class WebView {
    private id: number = 0;

    constructor(args: {
        title?: string;
        url?: string;
        width?: number;
        height?: number;
        resizable?: boolean;
        debug?: boolean;
        frameless?: boolean;
    }) {
        args = Object.assign(
            {
                title: "deno_webview",
                url: "about:blank",
                width: 800,
                height: 600,
                resizable: true,
                debug: true,
                frameless: false
            },
            args
        );

        this.id = Plugin.webviewNew(args as Plugin.NewArgs);
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
        return Plugin.webviewLoop({ id: this.id, blocking: 1 }) === 0;
    }

    /**
     * Exits the `WebView`
     */
    public exit(): boolean {
        return Plugin.webviewExit({ id: this.id });
    }

    /**
     * Evaluates the provided js code in the `WebView`
     */
    public eval(js: string): boolean {
        return Plugin.webviewEval({
            id: this.id,
            js: js
        });
    }

    /**
     * Injects the provided css into the `WebView`
     */
    public injectCss(css: string): boolean {
        return Plugin.webviewInjectCss({
            id: this.id,
            css: css
        });
    }

    /**
     * Sets the color of the title bar
     */
    public setColor(color: { r: number, g: number, b: number, a: number, }): boolean {
        return Plugin.webviewSetColor({
            id: this.id,
            ...color
        });
    }

    /**
     * Sets the window title
     */
    public setTitle(title: string): boolean {
        return Plugin.webviewSetTitle({
            id: this.id,
            title: title
        });
    }

    /**
     * Enables or disables fullscreen
     */
    public setFullscreen(fullscreen: boolean): boolean {
        return Plugin.webviewSetFullscreen({
            id: this.id,
            fullscreen: fullscreen
        });
    }
}
