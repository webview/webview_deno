import * as Plugin from "./plugin.ts";

const DEFAULT_PARAMS: Plugin.WebViewNewParams = {
  title: "deno_webview",
  url: "about:blank",
  width: 800,
  height: 600,
  resizable: true,
  debug: true,
  frameless: false,
};

/**
 * The constructor parameters
 */
export type WebViewParams = Partial<Plugin.WebViewNewParams>;

/**
 * A rgb(a) color
 */
export interface WebViewColor {
  r: number;
  g: number;
  b: number;
  a?: number;
}

/**
 * A WebView instance
 */
export class WebView {
  private id: number = 0;

  constructor(params: WebViewParams) {
    params = Object.assign(DEFAULT_PARAMS, params);

    this.id = Plugin.WebViewNew(params as Plugin.WebViewNewParams).id;
  }

  /**
     * Runs the event loop to completion
     */
  public async run() {
    await Plugin.WebViewRun({ id: this.id });
  }

  /**
     * Iterates the event loop and returns `false` if the the `WebView` has been closed
     */
  public step(): boolean {
    return Plugin.WebViewLoop({ id: this.id, blocking: 1 }).code === 0;
  }

  /**
     * Exits the `WebView`
     */
  public exit() {
    Plugin.WebViewExit({ id: this.id });
  }

  /**
     * Evaluates the provided js code in the `WebView`
     */
  public eval(js: string) {
    Plugin.WebViewEval({
      id: this.id,
      js: js,
    });
  }

  /**
     * Sets the color of the title bar
     */
  public setColor(color: WebViewColor) {
    Plugin.WebViewSetColor({
      id: this.id,
      r: color.r,
      g: color.g,
      b: color.b,
      a: color.a ?? 1,
    });
  }

  /**
     * Sets the window title
     */
  public setTitle(title: string) {
    Plugin.WebViewSetTitle({
      id: this.id,
      title: title,
    });
  }

  /**
     * Enables or disables fullscreen
     */
  public setFullscreen(fullscreen: boolean) {
    Plugin.WebViewSetFullscreen({
      id: this.id,
      fullscreen: fullscreen,
    });
  }
}
