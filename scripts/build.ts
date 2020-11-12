import { requires, run } from "./_util.ts";

export async function build() {
  await requires("cargo");

  await run("building rust", ["cargo", "build", "--release"]);
}

if (import.meta.main) {
  await build();
}
