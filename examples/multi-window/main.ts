import { serve } from "https://deno.land/std@0.153.0/http/server.ts";
import { preload } from "../../mod.ts";
await preload();

/**
 * A window helper class to handle the workers
 */
class Window {
  readonly worker: Worker;
  #closed = false;
  get closed() {
    return this.#closed;
  }

  constructor(script: string, onclose: () => unknown = () => void 0) {
    this.worker = new Worker(
      new URL(script, import.meta.url),
      {
        type: "module",
        deno: { namespace: true, permissions: "inherit" },
      } as never,
    );

    this.worker.addEventListener("message", (evt) => {
      console.log(`[Window "${script}"] Message:`, evt.data);
      if (evt.data === "close") {
        this.#closed = true;
        onclose();
      }
    });

    this.worker.addEventListener(
      "messageerror",
      (evt) => console.error(`[Window "${script}"] Message Error:`, evt.data),
    );

    this.worker.addEventListener(
      "error",
      (evt) => console.error(`[Window "${script}"] Error:`, evt),
    );
  }

  terminate(): Promise<void> {
    if (this.closed) {
      return Promise.resolve();
    }

    return new Promise<void>((res) =>
      setTimeout(() => {
        this.worker.postMessage("unload");
        this.worker.terminate();
        this.#closed = true;
        res();
      }, 25)
    );
  }
}

// The Server

const html = `
<html>
<body>
  <h1>Hello Deno!</h1>
  <button onclick='fetch("./beep").then(res => res.text()).then(alert)'>
    Beep
  </button>
</body>
</html>
`;

const server = serve((req) => {
  const pathname = new URL(req.url).pathname;

  if (pathname === "/beep") {
    return new Response("boop");
  } else if (!pathname || pathname === "/" || pathname === "/index.html") {
    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  } else {
    return new Response("Not Found", { status: 404 });
  }
}, { port: 8000 });

console.log("[Main] Listening on http://localhost:8000");

// The Windows

// Our cleanup function to help Deno exit when the Windows are closed

let cleaning = false;
async function cleanup() {
  if (cleaning) return;
  cleaning = true;

  await Promise.all(
    [windowLocal, windowDeno].map((window) => window.terminate()),
  );

  Deno.exit();
}

console.log("[Main] Spawning Windows");

const windowLocal = new Window("./window-localhost.ts", cleanup);
const windowDeno = new Window("./window-denoland.ts", cleanup);

// Window 2

console.log("[Main] Done! Running Server");

await server;
