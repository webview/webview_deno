export async function run(
  file: string = Deno.args[0],
  mshtml: boolean = Deno.args.includes("mshtml"),
) {
  const env: {
    [key: string]: string;
  } = {
    DEV: "file://./target/release",
  };

  if (mshtml) {
    env["MSHTML"] = "file://./target/release/deno_webview.dll";
  }

  const process = Deno.run({
    cmd: ["deno", "run", "-A", "-r", "--unstable", file],
    env,
  });

  if (!(await process.status()).success) {
    Deno.exit(1);
  }
}

if (import.meta.main) {
  await run();
}
