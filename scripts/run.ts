import * as util from "./util.ts";

export async function run(
  file: string = Deno.args[0],
  mshtml: boolean = Deno.args.includes("mshtml"),
) {
  await util.requires("deno");

  const env: {
    [key: string]: string;
  } = {
    WEBVIEW_DENO_PLUGIN_BASE: "file://./target/release",
    WEBVIEW_DENO_DEBUG: "1",
  };

  if (mshtml) {
    env["WEBVIEW_DENO_PLUGIN"] = "file://./target/release/webview_deno.dll";
  }

  await util.run(
    `Running deno run -A -r --unstable ${file}`,
    ["deno", "run", "-A", "-r", "--unstable", file],
    env,
  );
}

if (import.meta.main) {
  await run();
}
