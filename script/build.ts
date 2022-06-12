import { ensureDir } from "https://deno.land/std@0.143.0/fs/ensure_dir.ts";

await ensureDir("build");

await Deno.spawn(
  Deno.build.os === "windows" ? "script/build.bat" : "script/build.sh",
  {
    stdout: "inherit",
    stderr: "inherit",
  },
);
