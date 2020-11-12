import {
  WebviewCreate,
  WebviewDestroy,
  WebviewEval,
  WebviewInit,
  WebviewNavigate,
  WebviewRun,
  WebviewSetSize,
  WebviewSetTitle,
  WebviewTerminate,
} from "./plugin.ts";

export enum SizeHint {
  None = 0,
  Min = 1,
  Max = 2,
  Fixed = 3,
}

export interface Size {
  readonly width: number;
  readonly height: number;
  readonly hint: SizeHint;
}

export class Webview {
  public readonly id: number;

  #size: Size = {
    width: 400,
    height: 600,
    hint: SizeHint.None
  };
  #title: string = "webview_deno";
  #url: string = "about:blank";

  public get size(): Size {
    return this.#size;
  }

  public set size(size: Size) {
    this.resize(size);
  }

  public get title(): string {
    return this.#title;
  }

  public set title(title: string) {
    this.#title = title;
    WebviewSetTitle(this.id, this.#title);
  }

  public get url(): string {
    return this.#url;
  }

  public set url(url: string) {
    this.navigate(url);
  }

  constructor(debug = false) {
    this.id = WebviewCreate(debug);
  }

  /**
   * Runs the event loop to completion
   */
  public run(): void {
    WebviewRun(this.id);
  }

  /**
   * Navigates to the provided url
   */
  public navigate(url: string): void {
    this.#url = url;
    WebviewNavigate(this.id, url);
  }

  /**
   * Resizes the `Webview`
   */
  public resize(size: Size): void {
    this.#size = size;
    WebviewSetSize(this.id, size.width, size.height, size.hint);
  }

  /**
   * Initializes the provided js code
   */
  public init(js: string): void {
    WebviewInit(this.id, js);
  }

  /**
   * Evaluates the provided js code
   */
  public eval(js: string): void {
    WebviewEval(this.id, js);
  }

  /**
   * Drops the `Webview`
   */
  public drop() {
    WebviewTerminate(this.id);
    WebviewDestroy(this.id);
  }

  /**
   * Terminates the instance
   */
  public terminate() {
    WebviewTerminate(this.id);
  }
}
