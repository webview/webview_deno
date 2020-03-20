export async function fmt(mshtml: boolean = Deno.args.includes("mshtml")) {
  const cargo = Deno.run({
    args: ["cargo", "fmt"]
  });

  const deno = Deno.run({
    args: ["deno", "fmt"]
  });

  await Promise.all([cargo.status(), deno.status()]);
}

if (import.meta.main) {
  fmt();
}
