import { requires, run } from "./util.ts";

export async function build(mshtml: boolean = Deno.args.includes("mshtml")) {
  await requires("cargo");

  const command = ["cargo", "build", "--release", "--locked"];

  if (mshtml) {
    command.push("--no-default-features");
  }

  await run("Building...", command);
}

if (import.meta.main) {
  await build();
}
