import { ensureDir } from "https://deno.land/std@0.145.0/fs/ensure_dir.ts";

const decoder = new TextDecoder();

const archMap: { [k in typeof Deno.build.arch]: string } = {
  "x86_64": "x86_64",
  "aarch64": "arm64",
} as const;

function indent(source: string, spaces = 2): string {
  return source.split("\n").map((line) => `${" ".repeat(spaces)}${line}\n`)
    .join("");
}

const ExitType = {
  Exit: "exit",
  Fail: "fail",
  Never: "never",
} as const;
type ExitType = typeof ExitType[keyof typeof ExitType];

async function spawn<T extends Deno.SpawnOptions>(
  cmd: string,
  { opts, exit }: { opts?: T; exit?: ExitType } = { exit: ExitType.Never },
): Promise<{
  status: Deno.ChildStatus;
  stdout: string;
  stderr: string;
}> {
  if (opts !== undefined) {
    opts.stdout = "piped";
    opts.stderr = "piped";
  }

  const { status, stdout, stderr } = await Deno.spawn(cmd, opts);

  if (status.success) {
    console.log(`Successfully ran "${cmd} ${(opts?.args ?? []).join(" ")}"`);
  } else {
    console.log(`Failed run "${cmd}"`);
    console.log(`stdout:\n${indent(decoder.decode(stdout!))}`);
    console.log(`stderr:\n${indent(decoder.decode(stderr!))}`);
    console.log(`status: ${status.code}`);

    if (exit === ExitType.Fail) {
      Deno.exit(status.code);
    }
  }

  if (exit === ExitType.Exit) {
    Deno.exit(status.code);
  }

  return {
    status,
    stdout: decoder.decode(stdout!),
    stderr: decoder.decode(stderr!),
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
          archMap[Deno.build.arch],
          "-o",
          `build/libwebview.${Deno.build.arch}.dylib`,
        ],
        env: {
          "CFLAGS": "",
        },
      },
    });
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
          "-c",
          "-DWEBVIEW_GTK",
          "-std=c++11",
          "-Wall",
          "-Wextra",
          "-pedantic",
          stdout,
          "-fpic",
          "-o",
          "build/webview.o",
        ],
      },
    });
    await spawn("c++", {
      opts: {
        exit: ExitType.Fail,
        args: [
          "build/webview.o",
          "-shared",
          "-o",
          "build/libwebview.so",
        ],
      },
    });
    Deno.exit(0);
    break;
  }
}
