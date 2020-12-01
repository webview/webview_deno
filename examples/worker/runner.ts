import { dirname, join } from "https://deno.land/std/path/mod.ts";

const worker = new Worker(
  join(dirname(import.meta.url), "worker.ts"),
  { type: "module", deno: true },
);

console.log("Worker is running, closing in 5 seconds");
setTimeout(() => {
  console.log("Closing worker");
  worker.postMessage("close");
}, 5000);
