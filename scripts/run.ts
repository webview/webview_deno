import * as util from "./_util.ts";

export async function run(
  file: string = Deno.args[0],
) {
  await util.requires("deno");

  const env: {
    [key: string]: string;
  } = {
    WEBVIEW_DENO_PLUGIN_BASE: "file://./target/release",
    WEBVIEW_DENO_DEBUG: "1",
  };

  await util.run(
    `running`,
    ["deno", "run", "-Ar", "--unstable", file],
    env,
  );
}

if (import.meta.main) {
  await run();
}
