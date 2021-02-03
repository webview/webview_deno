import { requires, run } from "./_util.ts";

export async function build(mshtml: boolean) {
  await requires("cargo");

  const command = ["cargo", "build", "--release"];

  if (mshtml) {
    command.push("--no-default-features");
  }

  await run("building rust", command);
}

if (import.meta.main) {
  await build(Deno.args.includes("mshtml"));
}
