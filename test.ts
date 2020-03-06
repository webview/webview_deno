import { run } from "./mod.ts";

await run({
    title: "Hello World!",
    width: 300,
    height: 400,
    resizable: false,
    debug: true,
    content: `Hello from deno`
});
