export async function requires(...executables: string[]) {
  const where = Deno.build.os === "windows" ? "where" : "which";

  for (const executable of executables) {
    const process = Deno.run({
      cmd: [where, executable],
      stderr: "null",
      stdin: "null",
      stdout: "null",
    });

    if (!(await process.status()).success) {
      err(`Could not find required build tool ${executable}`);
    }
  }
}

export async function run(
  msg: string,
  cmd: string[],
  env?: { [key: string]: string },
) {
  log(msg);

  const process = Deno.run({ cmd, env });

  if (!(await process.status()).success) {
    err(`${msg} failed`);
  }
}

export function log(text: string): void {
  console.log(`[log] ${text}`);
}

export function err(text: string): never {
  console.log(`[err] ${text}`);
  return Deno.exit(1);
}
