import { sync, unwrap } from "./plugin.ts";
import { delay } from "./deps.ts";

function debounce<T extends unknown[], R>(
  func: (...args: T) => Promise<R>,
  time: number,
): (...args: T) => Promise<R> {
  return async (...args) => {
    const promise = func(...args);
    const timer = delay(time);
    const response = await promise;
    await timer;
    return response;
  };
}

export interface WebviewParams {
  title: string;
  url: string;
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  resizable: boolean;
  debug: boolean;
  frameless: boolean;
  visible: boolean;
}

export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

/**
 * A Webview instance
 */
export class Webview {
  readonly id: bigint;

  /**
   * Creates a new Webview instance
   */
  constructor({
    title = "webview_deno",
    url = "about:blank",
    width = 800,
    height = 600,
    minWidth = 300,
    minHeight = 300,
    resizable = true,
    debug = false,
    frameless = false,
    visible = true,
  }: Partial<WebviewParams>) {
    this.id = unwrap(sync("webview_new", {
      title,
      url,
      width,
      height,
      minWidth,
      minHeight,
      resizable,
      debug,
      frameless,
      visible,
    }));
  }

  /**
   * Frees the Webview instance
   */
  free() {
    unwrap(sync("webview_free", { id: this.id }));
  }

  /**
   * Exits the Webview instance
   */
  exit() {
    unwrap(sync("webview_exit", { id: this.id }));
  }

  /**
   * Exits and frees the Webview instance
   */
  drop() {
    this.exit();
    this.free();
  }

  /**
   * Evaluates the provided js in the Webview instance, returns false if unsuccessful
   */
  eval(js: string): boolean {
    return unwrap(sync("webview_eval", { id: this.id, js })) === 0;
  }

  /**
   * Iterates one step in the event loop, returns false if closed or terminated
   */
  loop(block = false): boolean {
    return unwrap(sync("webview_loop", { id: this.id, block })) === 0;
  }

  /**
   * Steps one step in the event loop popping all accumulated events from the stack
   */
  step(): string[] {
    return unwrap(sync("webview_step", { id: this.id }));
  }

  /**
   * Iterates over the event loop until closed or terminated without
   * handling events
   */
  run(delta = 1000 / 60, block = false): Promise<void> {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        const succ = this.loop(block);

        if (!succ) {
          resolve();
          clearInterval(interval);
        }
      }, delta);
    });
  }

  /**
   * Iterates over the event loop, yielding external invoke events as strings and
   * returning once closed or terminated
   */
  async *iter(delta = 1000 / 60, block = false): AsyncIterableIterator<string> {
    let finished = false;
    
    const runner = debounce(async () => {
      const succ = this.loop(block);
      const evts = this.step();

      if (!succ) {
        finished = true;
      }

      return evts;
    }, delta);

    while (!finished) {
      const events = await runner();

      for (const event of events) {
        yield event;
      }
    }
  }

  /**
   * Sets the color of the title bar
   */
  setColor(
    { r, g, b, a = 255 }: RGBA,
  ) {
    unwrap(sync("webview_set_color", { id: this.id, r, g, b, a }));
  }

  /**
   * Enables or disables fullscreen
   */
  setFullscreen(fullscreen: boolean) {
    unwrap(sync("webview_set_fullscreen", { id: this.id, fullscreen }));
  }

  /**
   * Toggles window maximized
   */
  setMaximized(maximized: boolean) {
    unwrap(sync("webview_set_maximized", { id: this.id, maximized }));
  }

  /**
   * Toggles window minimized
   */
  setMinimized(minimized: boolean) {
    unwrap(sync("webview_set_minimized", { id: this.id, minimized }));
  }

  /**
   * Evaluates the provided js in the Webview instance, returns false if unsuccessful
   */
  setTitle(title: string) {
    unwrap(sync("webview_set_title", { id: this.id, title }));
  }

  /**
   * Sets window visibility
   */
  setVisible(visible: boolean) {
    unwrap(sync("webview_set_visible", { id: this.id, visible }));
  }
}
