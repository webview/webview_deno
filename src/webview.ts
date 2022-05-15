import sys from "./ffi.ts";

const encoder = new TextEncoder();

const encode = (value: string) => encoder.encode(value + "\0");

const decoder = new TextDecoder();

/** Window size hints */
export type SizeHint = 0 | 1 | 2 | 3;

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

/**
 * An instance of a webview window
 */
export class Webview {
  #handle: Deno.UnsafePointer | null = null;
  #channels: Deno.UnsafePointer[] = [];

  /**
   * An unsafe pointer to the webview
   */
  get unsafeHandle() {
    return this.#handle;
  }

  /**
   * Sets the native window size
   */
  set size(
    { width, height, hint }: { width: number; height: number; hint: SizeHint },
  ) {
    sys.symbols.deno_webview_set_size(this.#handle, width, height, hint);
  }

  /**
   * Sets the native window title
   */
  set title(title: string) {
    sys.symbols.deno_webview_set_title(this.#handle, encode(title));
  }

  /**
   * Creates a new webview instance
   *
   * @param debug Enables or disables developer tools
   */
  constructor(debug = false) {
    this.#handle = sys.symbols.deno_webview_create(
      Number(debug),
      null,
    ) as Deno.UnsafePointer;
  }

  async #channelRecv(
    channel: Deno.UnsafePointer,
  ): Promise<[string, string] | null> {
    const recv = await sys.symbols.deno_webview_channel_recv(channel);
    if (recv.value === 0n) {
      return null;
    }

    const recvView = new Deno.UnsafePointerView(recv);
    const seqLength = recvView.getUint32(0);
    const reqLength = recvView.getUint32(4 + seqLength);
    const recvBuf = new Uint8Array(4 + seqLength + 4 + reqLength);
    recvView.copyInto(recvBuf);
    sys.symbols.deno_webview_channel_recv_free(recv);

    const seqBuf = recvBuf.slice(4, 4 + seqLength);
    const reqBuf = recvBuf.slice(8 + seqLength, 4 + seqLength + 4 + reqLength);
    const seq = decoder.decode(seqBuf);
    const req = decoder.decode(reqBuf);
    return [seq, req];
  }

  /**
   * Destroys the webview and closes the window along with freeing internal resources
   */
  terminate() {
    for (const channel of this.#channels) {
      sys.symbols.deno_webview_channel_free(channel);
    }
    sys.symbols.deno_webview_terminate(this.#handle);
    sys.symbols.deno_webview_destroy(this.#handle);
    this.#handle = null;
  }

  /**
   * Navigates webview to the given URL. URL may be a data URI, i.e.
   * `"data:text/html,<html>...</html>"`. It is often ok not to url-encode it
   * properly, webview will re-encode it for you.
   */
  navigate(url: URL | string) {
    sys.symbols.deno_webview_navigate(
      this.#handle,
      encode(url instanceof URL ? url.toString() : url),
    );
  }

  /**
   * Takes a single step in the webview event loop
   *
   * @param blocking Wheter or not to wait for an event, by default this is `false`
   * @returns `true` if the step was successful, otherwise `false`
   */
  step(blocking: boolean): boolean {
    return sys.symbols.deno_webview_step(this.#handle, Number(blocking)) === 0;
  }

  /**
   * Runs the webview asynchronously. This is the recommended way of running a
   * webview as it does not block the JavaScript event loop and allows for
   * using {@link Webview.bind} to bind functions from deno to the webview
   * JavaScript environment.
   *
   * @param blocking Wheter or not to wait for an event, by default this is `false`
   * @param delta How often in milliseconds to take a step in the event loop, by default this is `0`
   */
  run(async?: true, blocking?: boolean, delta?: number): Promise<void>;
  /**
   * Runs the webview synchronously.
   *
   * Caution: running it this way will break {@link Webview.bind} and all other
   * associated methods along with blocking the JavaScript event loop. It is
   * therefor not recommended.
   */
  run(async: false): void;
  run(async = true, blocking = false, delta = undefined): void | Promise<void> {
    if (!async) {
      sys.symbols.deno_webview_run(this.#handle);
    }

    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (!this.step(blocking)) {
          this.terminate();
          clearInterval(interval);
          resolve();
        }
      }, delta);
    });
  }

  /**
   * Binds a callback so that it will appear in the webview with the given name
   * as a global async JavaScript function. Callback receives a seq and req value.
   * The seq parameter is an identifier for using {@link Webview.return} to
   * return a value while the req parameter is a string of an JSON array representing
   * the arguments passed from the JavaScript function call.
   *
   * @param name The name of the bound function
   * @param cb A callback which takes two strings as parameters: `seq` and `req`
   */
  bindRaw(name: string, cb: (seq: string, req: string) => void) {
    const channel = sys.symbols.deno_webview_bind(this.#handle, encode(name));
    this.#channels.push(channel);

    const iter = async () => {
      const recv = await this.#channelRecv(channel);
      if (recv !== null) {
        cb(...recv);
        await iter();
      }
    };

    iter();
  }

  /**
   * Binds a callback so that it will appear in the webview with the given name
   * as a global async JavaScript function. Callback arguments are automatically
   * converted from json to as closely as possible match the arguments in the
   * webview context and the callback automatically converts and returns the
   * return value to the webview.
   *
   * @param name The name of the bound function
   * @param cb A callback which is passed the arguments as called from the
   * webview JavaScript environment and optionally returns a value to the
   * webview JavaScript caller
   */
  // deno-lint-ignore no-explicit-any
  bind(name: string, cb: (...args: any) => any) {
    this.bindRaw(name, (seq, req) => {
      const args = JSON.parse(req);

      let result;
      let success: boolean;
      try {
        result = cb(...args);
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
   * Returns a value to the webview JavaScript environment.
   *
   * @param seq The request pointer as provided by the {@link Webview.bindRaw} callback
   * @param status If status is zero the result is expected to be a valid JSON result value otherwise the result is an error JSON object
   * @param result The stringified JSON response
   */
  return(seq: string, status: number, result: string) {
    sys.symbols.deno_webview_return(
      this.#handle,
      encode(seq),
      status,
      encode(result),
    );
  }

  /**
   * Evaluates arbitrary JavaScript code. Evaluation happens asynchronously, also
   * the result of the expression is ignored. Use {@link Webview.bind bindings} if you want to
   * receive notifications about the results of the evaluation.
   */
  eval(source: string) {
    sys.symbols.deno_webview_eval(this.#handle, encode(source));
  }

  /**
   * Injects JavaScript code at the initialization of the new page. Every time
   * the webview will open a the new page - this initialization code will be
   * executed. It is guaranteed that code is executed before window.onload.
   */
  init(source: string) {
    sys.symbols.deno_webview_init(this.#handle, encode(source));
  }
}
