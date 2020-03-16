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

    this.id = Plugin.WebViewNew(args as Plugin.WebViewNewParams).id;
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
      js: js
    });
  }

  /**
   * Sets the color of the title bar
   */
  public setColor(color: { r: number; g: number; b: number; a: number }) {
    Plugin.WebViewSetColor({
      id: this.id,
      ...color
    });
  }

  /**
   * Sets the window title
   */
  public setTitle(title: string) {
    Plugin.WebViewSetTitle({
      id: this.id,
      title: title
    });
  }

  /**
   * Enables or disables fullscreen
   */
  public setFullscreen(fullscreen: boolean) {
    Plugin.WebViewSetFullscreen({
      id: this.id,
      fullscreen: fullscreen
    });
  }
}
