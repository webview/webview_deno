import { build } from "./build.ts";

export async function dev(file: string = Deno.args[0]) {
  await build();

  Deno.run({
    args: ["deno", "run", "-A", file],
    env: {
      "DEV": "file://./target/release"
    }
  });
}

if (import.meta.main) {
  dev();
}
