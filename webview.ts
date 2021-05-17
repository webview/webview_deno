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
  #callbacks: Map<string, (...args: unknown[]) => unknown> = new Map();

  constructor(debug = false) {
    this.rid = Plug.core.opSync("webview_create", debug);
  }

  async run() {
    await Plug.core.opAsync("webview_run", this.rid);

    // for await (const { name, seq, req } of this.poll()) {
    //   try {
    //     const res = this.#callbacks.get(name)!(...JSON.parse(req));
    //     this.return(seq, 0, JSON.stringify(res));
    //   } catch (err) {
    //     this.return(seq, 1, err);
    //   }
    // }
  }

  terminate() {
    Plug.core.opSync("webview_terminate", this.rid);
  }

  setTitle(title: string) {
    Plug.core.opSync("webview_set_title", { rid: this.rid, val: title });
  }

  setSize(width: number, height: number, hints: SizeHint) {
    Plug.core.opSync("webview_set_title", [this.rid, width, height, hints]);
  }

  navigate(url: string) {
    Plug.core.opSync("webview_navigate", { rid: this.rid, val: url });
  }

  init(js: string) {
    Plug.core.opSync("webview_init", { rid: this.rid, val: js });
  }

  eval(js: string) {
    Plug.core.opSync("webview_eval", { rid: this.rid, val: js });
  }

  bind<A extends unknown[], R>(name: string, callback: (...args: A) => R) {
    Plug.core.opSync("webview_bind", { rid: this.rid, val: name });

    this.#callbacks.set(name, callback as (...args: unknown[]) => unknown);
  }

  return(seq: string, status: number, result: string) {
    Plug.core.opSync("webview_return", {
      rid: this.rid,
      seq,
      status,
      result,
    });
  }

  async *poll() {
    while (true) {
      const event: undefined | { name: string; seq: string; req: string } =
        await Plug.core.opAsync("webview_poll_next", this.rid);

      if (event !== undefined) {
        yield event;
      } else {
        break;
      }
    }
  }
}
