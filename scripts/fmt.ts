export async function fmt(mshtml: boolean = Deno.args.includes("mshtml")) {
  const cargo = Deno.run({
    cmd: ["cargo", "fmt"]
  });

  const deno = Deno.run({
    cmd: ["deno", "fmt"]
  });

  await Promise.all([cargo.status(), deno.status()]);
}

if (import.meta.main) {
  fmt();
}
