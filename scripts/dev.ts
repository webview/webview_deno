import { build } from "./build.ts";

export async function dev(
    file: string = Deno.args[0],
    mshtml: boolean = Deno.args.includes("mshtml")
) {
    await build();

    const env: {
        [key: string]: string;
    } = {
        DEV: "file://./target/release"
    };

    if (mshtml) {
        env["MSHTML"] = "file://./target/release/deno_webview.dll";
    }

    Deno.run({
        args: ["deno", "run", "-A", "-r", file],
        env
    });
}

if (import.meta.main) {
    await dev();
}
