import sys from "./ffi.ts";

function encode(value: string): Deno.UnsafePointer {
  const encoded = new TextEncoder().encode(value);
  const buffer = new Uint8Array(encoded.byteLength + 1);
  buffer.set(encoded, 0);

  buffer[buffer.byteLength - 1] = 0x00;
  return Deno.UnsafePointer.of(buffer);
}

export type SizeHint = 0 | 1 | 2 | 3;

export const SizeHint = {
  NONE: 0,
  MIN: 1,
  MAX: 2,
  FIXED: 3,
} as const;

export class Webview {
  #handle: Deno.UnsafePointer | null;
  #url?: string;

  get unsafeHandle() {
    return this.#handle;
  }

  get url(): string {
    if (this.#url == undefined) throw new TypeError("Webview not initialized");
    return this.#url;
  }

  constructor() {
    this.#handle = sys.symbols.webview_create(0, null) as Deno.UnsafePointer;
  }

  terminate() {
    sys.symbols.webview_terminate(this.#handle);
    sys.symbols.webview_destroy(this.#handle);
    this.#handle = null;
  }

  navigate(url: string) {
    this.#url = url;
    sys.symbols.webview_navigate(this.#handle, encode(url));
  }

  run() {
    sys.symbols.webview_run(this.#handle);
  }

  eval(js: string) {
    sys.symbols.webview_eval(this.#handle, encode(js));
  }

  set title(title: string) {
    sys.symbols.webview_set_title(this.#handle, encode(title));
  }
}
