import { build } from "./build.ts";
import { run } from "./run.ts";

export async function dev(
  file: string,
  mshtml: boolean,
) {
  await build(mshtml);
  await run(file);
}

if (import.meta.main) {
  await dev(Deno.args[0], Deno.args.includes("mshtml"));
}
