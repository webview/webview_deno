import * as util from "./util.ts";

export async function run(
  file: string = Deno.args[0],
  mshtml: boolean = Deno.args.includes("mshtml"),
) {
  await util.requires("deno");

  const env: {
    [key: string]: string;
  } = {
    DENO_WEBVIEW_PLUGIN_BASE: "file://./target/release",
    DENO_WEBVIEW_DEBUG: "1",
  };

  if (mshtml) {
    env["DENO_WEBVIEW_PLUGIN"] = "file://./target/release/deno_webview.dll";
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
