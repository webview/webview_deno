import { $ } from "jsr:@david/dax@0.42.0";
import process from "node:process";

const { arch, platform } = process;

switch (platform) {
  case "win32":
    await $`
        scripts/build.bat
        cp webview/build/core/Release/webview.dll build/libwebview.dll
        `;
    break;
  case "linux":
    await $`
        cd webview
        export PATH=/usr/lib/llvm14/bin/:/usr/lib/llvm-14/bin/:/usr/lib64/llvm15/bin/:$PATH
        cmake -G Ninja -B build -S . -D CMAKE_BUILD_TYPE=Release -D WEBVIEW_WEBKITGTK_API=6.0 -DWEBVIEW_ENABLE_CHECKS=false -DCMAKE_TOOLCHAIN_FILE=cmake/toolchains/host-llvm.cmake
        cmake --build build
        cp build/core/libwebview.so ../build/libwebview-${arch}.so
        strip ../build/libwebview-${arch}.so
        `;
    break;

  case "darwin":
    await $`
        cd webview
        cmake -G "Ninja Multi-Config" -B build -S . -DCMAKE_TOOLCHAIN_FILE=cmake/toolchains/universal-macos-llvm.cmake
        cmake --build build --config Release
        cp build/core/Release/libwebview.dylib ../build/libwebview.dylib
        strip -x -S ../build/libwebview.dylib
        `;
    break;
}

// import { ensureDir } from "jsr:@std/fs@0.218/ensure_dir";

// const decoder = new TextDecoder();
// const architectures = [["x86_64", "x86_64"], ["aarch64", "arm64"]] as const;

// const ExitType = {
//   Exit: "exit",
//   Fail: "fail",
//   Never: "never",
// } as const;
// type ExitType = typeof ExitType[keyof typeof ExitType];

// const LogType = {
//   Success: "success",
//   Always: "always",
//   Fail: "fail",
//   Never: "never",
// } as const;
// type LogType = typeof LogType[keyof typeof LogType];

// function indent(source: string, spaces = 2): string {
//   return source.split("\n").map((line) => `${" ".repeat(spaces)}${line}\n`)
//     .join("");
// }

// async function command<T extends Deno.CommandOptions>(
//   cmd: string,
//   { opts, exit, log }: { opts?: T; exit?: ExitType; log?: LogType } = {},
// ): Promise<{
//   code: number;
//   stdout: string;
//   stderr: string;
// }> {
//   if (opts !== undefined) {
//     opts.stdout = "piped";
//     opts.stderr = "piped";
//   }

//   exit ??= ExitType.Never;
//   log ??= LogType.Always;

//   const command = new Deno.Command(cmd, opts);
//   const { code, stdout, stderr } = await command.output();

//   const stdoutStr = decoder.decode(stdout);
//   const stderrStr = decoder.decode(stderr);

//   if (code === 0) {
//     if (log !== "never") {
//       console.log(`Successfully ran "${cmd} ${(opts?.args ?? []).join(" ")}"`);
//     }

//     if (log === "success" || log === "always") {
//       if (stdoutStr.length !== 0) {
//         console.log(`stdout:\n${indent(stdoutStr)}`);
//       }
//       if (stderrStr.length !== 0) {
//         console.log(`stderr:\n${indent(stderrStr)}`);
//       }
//     }
//   } else {
//     if (log !== "never") {
//       console.log(`Failed run "${cmd}"`);
//     }

//     if (log === "fail" || log === "always") {
//       if (stdoutStr.length !== 0) {
//         console.log(`stdout:\n${indent(stdoutStr)}`);
//       }
//       if (stderrStr.length !== 0) {
//         console.log(`stderr:\n${indent(stderrStr)}`);
//       }
//       console.log(`code: ${code}`);
//     }

//     if (exit === ExitType.Fail) {
//       Deno.exit(code);
//     }
//   }

//   if (exit === ExitType.Exit) {
//     Deno.exit(code);
//   }

//   return {
//     code,
//     stdout: stdoutStr,
//     stderr: stderrStr,
//   };
// }

// await ensureDir("build");

// switch (Deno.build.os) {
//   case "windows": {
//     await command("script/build.bat", {
//       exit: ExitType.Exit,
//     });
//     break;
//   }

//   case "darwin": {
//     for (const [denoArch, gccArch] of architectures) {
//       await command("c++", {
//         opts: {
//           exit: ExitType.Fail,
//           args: [
//             "webview/webview.cc",
//             "-dynamiclib",
//             "-fpic",
//             "-DWEBVIEW_COCOA",
//             "-std=c++11",
//             "-Wall",
//             "-Wextra",
//             "-pedantic",
//             "-framework",
//             "WebKit",
//             "-arch",
//             gccArch,
//             "-o",
//             `build/libwebview.${denoArch}.dylib`,
//           ],
//         },
//       });
//     }
//     Deno.exit(0);
//     break;
//   }

//   case "linux": {
//     const { stdout } = await command("pkg-config", {
//       opts: {
//         args: [
//           "--cflags",
//           "--libs",
//           "gtk+-3.0",
//           "webkit2gtk-4.0",
//         ],
//       },
//     });
//     await command("c++", {
//       opts: {
//         exit: ExitType.Fail,
//         args: [
//           "webview/webview.cc",
//           "-DWEBVIEW_GTK",
//           "-shared",
//           "-std=c++11",
//           "-Wall",
//           "-Wextra",
//           "-pedantic",
//           "-fpic",
//           ...stdout.trim().split(" "),
//           "-o",
//           "build/libwebview.so",
//         ],
//       },
//     });
//     Deno.exit(0);
//     break;
//   }
// }
