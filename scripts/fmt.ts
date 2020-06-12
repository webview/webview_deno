import { requires, run } from "./util.ts";

export async function fmt(mshtml: boolean = Deno.args.includes("mshtml")) {
  await requires("cargo", "deno");

  await run(
    "Running cargo clippy",
    ["cargo", "clippy", "--release", "--locked"],
  );
  await run("Running cargo fmt", ["cargo", "fmt"]);
  await run("Running deno fmt", ["deno", "fmt"]);
}

if (import.meta.main) {
  fmt();
}
