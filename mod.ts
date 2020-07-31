import {
  WebviewCreate, WebviewCreateParams, WebviewRun, WebviewDestroy, WebviewTerminate, WebviewEval, WebviewSetTitle, WebviewSetSize, WebviewInit, WebviewNavigate,
} from "./plugin.ts";

export enum SizeHint {
  NONE = 0,
  MIN = 1,
  MAX = 2,
  FIXED = 3,
}

/**
 * A Webview instance
 */
export class Webview {
  readonly #id: number = 0;

  constructor(params: WebviewCreateParams = { debug: false }) {
    this.#id = WebviewCreate(params).id;
  }

  /**
   * Runs the event loop to completion
   */
  public async run() {
    await WebviewRun({ id: this.#id });
  }

  /**
   * Drops the `Webview`
   */
  public drop() {
    WebviewTerminate({ id: this.#id });
    WebviewDestroy({ id: this.#id });
  }

  /**
   * Terminates the instance
   */
  public terminate() {
    WebviewTerminate({ id: this.#id });
  }

  /**
   * Evaluates the provided js code
   */
  public eval(js: string) {
    WebviewEval({
      id: this.#id,
      js: js,
    });
  }

  /**
   * Initializes the provided js code
   */
  public init(js: string) {
    WebviewInit({
      id: this.#id,
      js: js,
    });
  }

  /**
   * Navigates to the provided url
   */
  public navigate(url: string) {
    WebviewNavigate({
      id: this.#id,
      url,
    });
  }

  /**
   * Sets the window title
   */
  public setTitle(title: string) {
    WebviewSetTitle({
      id: this.#id,
      title: title,
    });
  }

  /**
   * Sets the window size
   */
  public setSize(width: number, height: number, hint: SizeHint = SizeHint.NONE) {
    WebviewSetSize({
      id: this.#id,
      width,
      height,
      hint
    });
  }
}
