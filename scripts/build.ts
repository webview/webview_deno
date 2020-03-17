export async function build(mshtml: boolean = Deno.args.includes("mshtml")) {
  const command = ["cargo", "build", "--release", "--locked"];

  if (mshtml) {
    command.push("--no-default-features");
  }

  const cargo = Deno.run({
    args: command
  });
  await cargo.status();
}

if (import.meta.main) {
  build();
}
