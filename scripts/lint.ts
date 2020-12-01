import { requires, run } from "./_util.ts";

export async function lint() {
  await requires("cargo", "deno");

  await run("linting rust", ["cargo", "clippy"]);
  await run("linting deno", ["deno", "--unstable", "lint"]);
}

if (import.meta.main) {
  lint();
}
