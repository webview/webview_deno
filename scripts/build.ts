export async function build(mshtml: boolean = Deno.args.includes("mshtml")) {
  const command = ["cargo", "build", "--release", "--locked"];

  if (mshtml) {
    command.push("--no-default-features");
  }

  const cargo = Deno.run({
    cmd: command,
  });

  if (!(await cargo.status()).success) {
    Deno.exit(1);
  }
}

if (import.meta.main) {
  await build();
}
