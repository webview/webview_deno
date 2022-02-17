import sys from "./ffi.ts";

const encoder = new TextEncoder();

function encode(value: string) {
  return encoder.encode(value + "\0");
}

export type SizeHint = 0 | 1 | 2 | 3;

export const SizeHint = {
  NONE: 0,
  MIN: 1,
  MAX: 2,
  FIXED: 3,
} as const;

export class Webview {
  #handle: Deno.UnsafePointer | null = null;
  #url?: string;

  get unsafeHandle() {
    return this.#handle;
  }

  get url(): string {
    if (this.#url == undefined) throw new TypeError("Webview not initialized");
    return this.#url;
  }

  constructor(width: number = 1024, height: number = 768, hint: SizeHint = 0) {
    this.#handle = sys.symbols.deno_webview_create(
      0,
      null,
    ) as Deno.UnsafePointer;
    sys.symbols.deno_webview_set_size(this.#handle, width, height, hint);
  }

  terminate() {
    sys.symbols.deno_webview_terminate(this.#handle);
    sys.symbols.deno_webview_destroy(this.#handle);
    this.#handle = null;
  }

  navigate(url: string) {
    this.#url = url;
  }

  run() {
    if (this.#url == null) throw new TypeError("URL not initialized");
    sys.symbols.deno_webview_navigate(this.#handle, encode(this.#url));
    sys.symbols.deno_webview_run(this.#handle);
  }

  set title(title: string) {
    sys.symbols.deno_webview_set_title(this.#handle, encode(title));
  }

  // TODO(@littledivy): Current design limitations prevent this from working
  // We need Rust to call into V8 and Deno FFI callbacks *might* solve this.
  bind(name: string, cb: (seq: string, recv: Deno.UnsafePointer) => void) {
    sys.symbols.deno_webview_bind(this.#handle, encode(name));
    sys.symbols.deno_webview_get_recv().then((recv) => {
      const ptr = new Deno.UnsafePointerView(recv as Deno.UnsafePointer);
      const lengthBe = new Uint8Array(4);
      const view = new DataView(lengthBe.buffer);
      ptr.copyInto(lengthBe, 0);
      const buf = new Uint8Array(view.getUint32(0));
      ptr.copyInto(buf, 4);

      const seq = new TextDecoder().decode(buf);
      cb(seq, recv);
    });
  }

  return(seq: string, status: number, result: string) {
    sys.symbols.deno_webview_return(
      this.#handle,
      encode(seq),
      status,
      encode(result),
    );
  }

  eval(source: string) {
    sys.symbols.deno_webview_eval(this.#handle, encode(source));
  }

  init(source: string) {
    sys.symbols.deno_webview_init(this.#handle, encode(source));
  }
}
