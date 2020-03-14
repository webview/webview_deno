export async function build(edge: boolean = Deno.args[0] === "edge") {
    const command = ["cargo", "build", "--release", "--locked"];

    // TODO (#3) fix
    if (edge) {
        command.push("--features edge");
    }

    const cargo = Deno.run({
        args: command
    });
    await cargo.status();
}

if (import.meta.main) {
    build();
}
