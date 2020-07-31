import { SizeHint, Webview } from "./webview.ts";

  // https://docs.rs/webview_official/0.0.3/src/webview_official/builder.rs.html

export class WebviewBuilder {
  #title?: string;
  #url?: string;
  #init?: string;
  #eval?: string;
  #size: [ number, number, SizeHint, ] =[
    400, 600, SizeHint.NONE,
  ];
  #debug: boolean = false;

  public debug(debug: boolean): WebviewBuilder {
    this.#debug = debug;

    return this;
  }

  public title(title: string): WebviewBuilder {
    this.#title = title;

    return this;
  }

  public url(url: string): WebviewBuilder {
    this.#url = url;

    return this;
  }

  public init(init: string): WebviewBuilder {
    this.#init = init;

    return this;
  }

  public width(width: number): WebviewBuilder {
    this.#size[0] = width;

    return this;
  }

  public height(height: number): WebviewBuilder {
    this.#size[1] = height;

    return this;
  }

  public resize(hint: SizeHint): WebviewBuilder {
    this.#size[2] = hint;

    return this;
  }

  public build(): Webview {
    const webview = new Webview({debug: this.#debug});
    webview.setTitle(this.#title ?? "webview_deno");
    if (this.#init) webview.init(this.#init);
    webview.navigate(this.#url ?? "https://deno.land/fuck/my/life");
    if (this.#eval) webview.eval(this.#eval);
    webview.setSize(...this.#size);
    return webview;
  }
}