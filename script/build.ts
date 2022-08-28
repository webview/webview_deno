import { ensureDir } from "https://deno.land/std@0.153.0/fs/ensure_dir.ts";

const decoder = new TextDecoder();
const architectures = [["x86_64", "x86_64"], ["aarch64", "arm64"]] as const;

const ExitType = {
  Exit: "exit",
  Fail: "fail",
  Never: "never",
} as const;
type ExitType = typeof ExitType[keyof typeof ExitType];

const LogType = {
  Success: "success",
  Always: "always",
  Fail: "fail",
  Never: "never",
} as const;
type LogType = typeof LogType[keyof typeof LogType];

function indent(source: string, spaces = 2): string {
  return source.split("\n").map((line) => `${" ".repeat(spaces)}${line}\n`)
    .join("");
}

async function spawn<T extends Deno.SpawnOptions>(
  cmd: string,
  { opts, exit, log }: { opts?: T; exit?: ExitType; log?: LogType } = {},
): Promise<{
  status: Deno.ChildStatus;
  stdout: string;
  stderr: string;
}> {
  if (opts !== undefined) {
    opts.stdout = "piped";
    opts.stderr = "piped";
  }

  exit ??= ExitType.Never;
  log ??= LogType.Always;

  const result = await Deno.spawn(cmd, opts);

  const stdout = decoder.decode(result.stdout!);
  const stderr = decoder.decode(result.stderr!);

  if (result.success) {
    if (log !== "never") {
      console.log(`Successfully ran "${cmd} ${(opts?.args ?? []).join(" ")}"`);
    }

    if (log === "success" || log === "always") {
      if (stdout.length !== 0) {
        console.log(`stdout:\n${indent(stdout)}`);
      }
      if (stderr.length !== 0) {
        console.log(`stderr:\n${indent(stderr)}`);
      }
    }
  } else {
    if (log !== "never") {
      console.log(`Failed run "${cmd}"`);
    }

    if (log === "fail" || log === "always") {
      if (stdout.length !== 0) {
        console.log(`stdout:\n${indent(stdout)}`);
      }
      if (stderr.length !== 0) {
        console.log(`stderr:\n${indent(stderr)}`);
      }
      console.log(`status: ${result.code}`);
    }

    if (exit === ExitType.Fail) {
      Deno.exit(result.code);
    }
  }

  if (exit === ExitType.Exit) {
    Deno.exit(result.code);
  }

  return {
    status: result,
    stdout,
    stderr,
  };
}

await ensureDir("build");

switch (Deno.build.os) {
  case "windows": {
    await spawn("script/build.bat", {
      exit: ExitType.Exit,
    });
    break;
  }

  case "darwin": {
    for (const [denoArch, gccArch] of architectures) {
      await spawn("c++", {
        opts: {
          exit: ExitType.Fail,
          args: [
            "webview/webview.cc",
            "-dynamiclib",
            "-fpic",
            "-DWEBVIEW_COCOA",
            "-std=c++11",
            "-Wall",
            "-Wextra",
            "-pedantic",
            "-framework",
            "WebKit",
            "-arch",
            gccArch,
            "-o",
            `build/libwebview.${denoArch}.dylib`,
          ],
        },
      });
    }
    Deno.exit(0);
    break;
  }

  case "linux": {
    const { stdout } = await spawn("pkg-config", {
      opts: {
        args: [
          "--cflags",
          "--libs",
          "gtk+-3.0",
          "webkit2gtk-4.0",
        ],
      },
    });
    await spawn("c++", {
      opts: {
        exit: ExitType.Fail,
        args: [
          "webview/webview.cc",
          "-DWEBVIEW_GTK",
          "-shared",
          "-std=c++11",
          "-Wall",
          "-Wextra",
          "-pedantic",
          "-fpic",
          ...stdout.trim().split(" "),
          "-o",
          "build/libwebview.so",
        ],
      },
    });
    Deno.exit(0);
    break;
  }
}
