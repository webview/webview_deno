import { Plug } from "./deps.ts";

export type SizeHint = 0 | 1 | 2 | 3;

export const SizeHint = {
  NONE: 0,
  MIN: 1,
  MAX: 2,
  FIXED: 3,
} as const;

/**
 * A Webview instance
 */
export class Webview {
  readonly rid: number;

  constructor(debug = false) {
    this.rid = Plug.core.opSync("webview_create", debug);
  }

  run() {
    Plug.core.opSync("webview_run", this.rid);
  }

  terminate() {
    Plug.core.opSync("webview_terminate", this.rid);
  }

  setTitle(title: string) {
    Plug.core.opSync("webview_set_title", [this.rid, title]);
  }

  setSize(width: number, height: number, hints: SizeHint) {
    Plug.core.opSync("webview_set_title", [this.rid, width, height, hints]);
  }

  navigate(url: string) {
    Plug.core.opSync("webview_navigate", [this.rid, url]);
  }

  init(js: string) {
    Plug.core.opSync("webview_init", [this.rid, js]);
  }

  eval(js: string) {
    Plug.core.opSync("webview_eval", [this.rid, js]);
  }

  bind(name: string, callback: (seq: string, req: string) => void) {
    Plug.core.opSync("webview_bind", [this.rid, name]);

    Plug.core.opAsync("webview_poll_next", this.rid).then((value) => {
      if (value !== undefined) {
        const [seq, req] = value as [string, string];

        callback(seq, req);
      } else {
        throw new Error("Poll value is undefined");
      }
    });
  }

  return(seq: string, status: number, result: string) {
    Plug.core.opSync("webview_return", {
      rid: this.rid,
      seq,
      status,
      result,
    });
  }
}
