import sys, { instances } from "./ffi.ts";

const encoder = new TextEncoder();
const encode = (value: string) => encoder.encode(value + "\0");

/** Window size hints */
export type SizeHint = typeof SizeHint[keyof typeof SizeHint];

/** Window size hints */
export const SizeHint = {
  /** Width and height are default size */
  NONE: 0,
  /** Width and height are minimum bounds */
  MIN: 1,
  /** Width and height are maximum bounds */
  MAX: 2,
  /** Window size can not be changed by a user */
  FIXED: 3,
} as const;

/** Window size */
export interface Size {
  /** The width of the window */
  width: number;
  /** The height of the window */
  height: number;
  /** The window size hint */
  hint: SizeHint;
}

/**
 * An instance of a webview window.
 *
 * ## Examples
 *
 * ### Local
 *
 * ```ts
 * import { Webview } from "../mod.ts";
 *
 * const html = `
 *   <html>
 *   <body>
 *     <h1>Hello from deno v${Deno.version.deno}</h1>
 *   </body>
 *   </html>
 * `;
 *
 * const webview = new Webview();
 *
 * webview.navigate(`data:text/html,${encodeURIComponent(html)}`);
 * webview.run();
 * ```
 *
 * ### Remote
 *
 * ```ts
 * import { Webview } from "../mod.ts";
 *
 * const webview = new Webview();
 * webview.navigate("https://deno.land/");
 * webview.run();
 * ```
 */
export class Webview {
  #handle: bigint | null = null;
  #callbacks: Map<string, Deno.UnsafeCallback> = new Map();
  #dispatches: Deno.UnsafeCallback[] = [];

  /** **UNSTABLE**: Highly unsafe API, beware!
   *
   * An unsafe pointer to the webview
   */
  get unsafeHandle() {
    return this.#handle;
  }

  /**
   * Sets the native window size
   *
   * ## Example
   *
   * ```ts
   * import { Webview, SizeHint } from "../mod.ts";
   *
   * const webview = new Webview();
   * webview.navigate("https://deno.land/");
   *
   * // Change from the default size to a small fixed window
   * webview.size = {
   *   width: 200,
   *   height: 200,
   *   hint: SizeHint.FIXED
   * };
   *
   * webview.run();
   * ```
   */
  set size(
    { width, height, hint }: Size,
  ) {
    sys.symbols.webview_set_size(this.#handle, width, height, hint);
  }

  /**
   * Sets the native window title
   *
   * ## Example
   *
   * ```ts
   * import { Webview } from "../mod.ts";
   *
   * const webview = new Webview();
   * webview.navigate("https://deno.land/");
   *
   * // Set the window title to "Hello world!"
   * webview.title = "Hello world!";
   *
   * webview.run();
   * ```
   */
  set title(title: string) {
    sys.symbols.webview_set_title(this.#handle, encode(title));
  }

  /** **UNSTABLE**: Highly unsafe API, beware!
   *
   * Creates a new webview instance from a webview handle.
   *
   * @param handle A previously created webview instances handle
   */
  constructor(handle: bigint);
  /**
   * Creates a new webview instance.
   *
   * @param debug Defaults to false, when true developer tools are enabled
   * for supported platforms
   * @param size The window size, default to 1024x768 with no size hint. Set
   * this to undefined if you do not want to automatically resize the window.
   * This may cause issues for MacOS where the window is invisible until
   * resized.
   *
   * ## Example
   *
   * ```ts
   * import { Webview, SizeHint } from "../mod.ts";
   *
   * // Create a new webview and change from the default size to a small fixed window
   * const webview = new Webview(true, {
   *   width: 200,
   *   height: 200,
   *   hint: SizeHint.FIXED
   * });
   *
   * webview.navigate("https://deno.land/");
   * webview.run();
   * ```
   */
  constructor(
    debug?: boolean,
    size?: Size,
  );
  constructor(
    debugOrHandle: boolean | bigint = false,
    size: Size | undefined = { width: 1024, height: 768, hint: SizeHint.NONE },
  ) {
    this.#handle = typeof debugOrHandle === "bigint"
      ? debugOrHandle
      : sys.symbols.webview_create(
        Number(debugOrHandle),
        null,
      );

    if (size !== undefined) {
      this.size = size;
    }

    // Push this instance to the global instances list to automatically destroy
    instances.push(this);
  }

  /**
   * Destroys the webview and closes the window along with freeing all internal
   * resources.
   */
  destroy() {
    for (const callback of Object.keys(this.#callbacks)) {
      this.unbind(callback);
    }
    for (const dispatch of this.#dispatches) {
      dispatch.close();
    }
    sys.symbols.webview_terminate(this.#handle);
    sys.symbols.webview_destroy(this.#handle);
    this.#handle = null;
  }

  /**
   * Navigates webview to the given URL. URL may be a data URI, i.e.
   * `"data:text/html,<html>...</html>"`. It is often ok not to url-encode it
   * properly, webview will re-encode it for you.
   */
  navigate(url: URL | string) {
    sys.symbols.webview_navigate(
      this.#handle,
      encode(url instanceof URL ? url.toString() : url),
    );
  }

  /**
   * Runs the main event loop until it's terminated. After this function exits
   * the webview is automatically destroyed.
   */
  run(): void {
    sys.symbols.webview_run(this.#handle);
    this.destroy();
  }

  /**
   * Binds a callback so that it will appear in the webview with the given name
   * as a global async JavaScript function. Callback receives a seq and req value.
   * The seq parameter is an identifier for using {@link Webview.return} to
   * return a value while the req parameter is a string of an JSON array representing
   * the arguments passed from the JavaScript function call.
   *
   * @param name The name of the bound function
   * @param callback A callback which takes two strings as parameters: `seq`
   * and `req` and the passed {@link arg} pointer
   * @param arg A pointer which is going to be passed to the callback once called
   */
  bindRaw(
    name: string,
    callback: (
      seq: string,
      req: string,
      arg: bigint | null,
    ) => void,
    arg: bigint | null = null,
  ) {
    const callbackResource = new Deno.UnsafeCallback(
      {
        parameters: ["pointer", "pointer", "pointer"],
        result: "void",
      },
      (
        seqPtr: bigint,
        reqPtr: bigint,
        arg: bigint | null,
      ) => {
        const seq = new Deno.UnsafePointerView(seqPtr).getCString();
        const req = new Deno.UnsafePointerView(reqPtr).getCString();
        callback(seq, req, arg);
      },
    );
    this.#callbacks.set(name, callbackResource);
    sys.symbols.webview_bind(
      this.#handle,
      encode(name),
      callbackResource.pointer,
      arg,
    );
  }

  /**
   * Binds a callback so that it will appear in the webview with the given name
   * as a global async JavaScript function. Callback arguments are automatically
   * converted from json to as closely as possible match the arguments in the
   * webview context and the callback automatically converts and returns the
   * return value to the webview.
   *
   * @param name The name of the bound function
   * @param callback A callback which is passed the arguments as called from the
   * webview JavaScript environment and optionally returns a value to the
   * webview JavaScript caller
   *
   * ## Example
   * ```ts
   * import { Webview } from "../mod.ts";
   *
   * const html = `
   *   <html>
   *   <body>
   *     <h1>Hello from deno v${Deno.version.deno}</h1>
   *     <button onclick="press('I was pressed!', 123, new Date()).then(log);">
   *       Press me!
   *     </button>
   *   </body>
   *   </html>
   * `;
   *
   * const webview = new Webview();
   *
   * webview.navigate(`data:text/html,${encodeURIComponent(html)}`);
   *
   * let counter = 0;
   * // Create and bind `press` to the webview javascript instance.
   * // This functions in addition to logging its parameters also returns
   * // a value from deno land to webview land.
   * webview.bind("press", (a, b, c) => {
   *   console.log(a, b, c);
   *
   *   return { times: counter++ };
   * });
   *
   * // Bind the `log` function in the webview to the parent instances `console.log`
   * webview.bind("log", (...args) => console.log(...args));
   *
   * webview.run();
   * ```
   */
  bind(
    name: string,
    // deno-lint-ignore no-explicit-any
    callback: (...args: any) => any,
  ) {
    this.bindRaw(name, (seq, req) => {
      const args = JSON.parse(req);
      let result;
      let success: boolean;
      try {
        result = callback(...args);
        success = true;
      } catch (err) {
        result = err;
        success = false;
      }
      if (result instanceof Promise) {
        result.then((result) =>
          this.return(seq, success ? 0 : 1, JSON.stringify(result))
        );
      } else {
        this.return(seq, success ? 0 : 1, JSON.stringify(result));
      }
    });
  }

  /**
   * Unbinds a previously bound function freeing its resource and removing it
   * from the webview JavaScript context.
   *
   * @param name The name of the bound function
   */
  unbind(name: string) {
    sys.symbols.webview_unbind(this.#handle, encode(name));
    this.#callbacks.get(name)?.close();
    this.#callbacks.delete(name);
  }

  /**
   * Returns a value to the webview JavaScript environment.
   *
   * @param seq The request pointer as provided by the {@link Webview.bindRaw}
   * callback
   * @param status If status is zero the result is expected to be a valid JSON
   * result value otherwise the result is an error JSON object
   * @param result The stringified JSON response
   */
  return(seq: string, status: number, result: string) {
    sys.symbols.webview_return(
      this.#handle,
      encode(seq),
      status,
      encode(result),
    );
  }

  /**
   * Evaluates arbitrary JavaScript code. Evaluation happens asynchronously,
   * also the result of the expression is ignored. Use
   * {@link Webview.bind bindings} if you want to receive notifications about
   * the results of the evaluation.
   */
  eval(source: string) {
    sys.symbols.webview_eval(this.#handle, encode(source));
  }

  /**
   * Injects JavaScript code at the initialization of the new page. Every time
   * the webview will open a the new page - this initialization code will be
   * executed. It is guaranteed that code is executed before window.onload.
   */
  init(source: string) {
    sys.symbols.webview_init(this.#handle, encode(source));
  }
}
