const worker = new Worker("./worker.ts", { type: "module", deno: true });

// Current problem is that it blocks recieving messages in the worker
worker.postMessage("close");
