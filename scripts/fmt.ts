export async function fmt(mshtml: boolean = Deno.args.includes("mshtml")) {
  const clippy = Deno.run({
    cmd: ["cargo", "clippy", "--release", "--locked"]
  });

  const rustfmt = Deno.run({
    cmd: ["cargo", "fmt"]
  });

  const denofmt = Deno.run({
    cmd: ["deno", "fmt"]
  });

  await Promise.all([clippy.status(), rustfmt.status(), denofmt.status()]);
}

if (import.meta.main) {
  fmt();
}
