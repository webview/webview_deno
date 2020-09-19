import { join, dirname } from "https://deno.land/std/path/mod.ts";

const worker = new Worker(
  join(dirname(import.meta.url), "worker.ts"),
  { type: "module", deno: true },
);

// Current problem is that it blocks recieving messages in the worker
worker.postMessage("close");
