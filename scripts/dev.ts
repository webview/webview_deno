import { build } from "./build.ts";
import { run } from "./run.ts";

export async function dev(
  file: string = Deno.args[0],
  mshtml: boolean = Deno.args.includes("mshtml"),
) {
  await build();
  await run();
}

if (import.meta.main) {
  await dev();
}
