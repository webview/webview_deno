import { requires, run } from "./_util.ts";

export async function fmt() {
  await requires("cargo", "deno");

  await run("formatting rust", ["cargo", "fmt"]);
  await run("formatting deno", ["deno", "fmt"]);
}

if (import.meta.main) {
  fmt();
}
