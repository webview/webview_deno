import { $ } from "jsr:@david/dax@0.42.0";

async function findClangFormat() {
  let WEBVIEW_CLANG_FORMAT_EXE = Deno.env.get("WEBVIEW_CLANG_FORMAT_EXE");
  if (WEBVIEW_CLANG_FORMAT_EXE) {
    return WEBVIEW_CLANG_FORMAT_EXE;
  }

  WEBVIEW_CLANG_FORMAT_EXE = await $.which("clang-format");
  if (WEBVIEW_CLANG_FORMAT_EXE) {
    return WEBVIEW_CLANG_FORMAT_EXE;
  }

  if (await $.commandExists("brew")) {
    const llvm = await $`brew --prefix llvm`.text();
    return `${llvm}/bin/clang-format"`;
  }

  $.logError(
    "error",
    "clang-format not found. Please install clang-format using brew or set the WEBVIEW_CLANG_FORMAT_EXE environment variable.",
  );
  Deno.exit(1);
}

$.setPrintCommand(true);

await $.path("./build").ensureDir();
switch (Deno.build.os) {
  case "windows": {
    await $`script/build.bat`;
    await $`cp webview/build/core/Release/webview.dll build/webview.dll`;
    break;
  }
  case "linux": {
    $.cd("webview");
    await $`export PATH=/usr/lib/llvm14/bin/:/usr/lib/llvm-14/bin/:/usr/lib64/llvm15/bin/:$PATH`;
    await $`cmake -G Ninja -B build -S . \
            -D CMAKE_BUILD_TYPE=Release \
            -D WEBVIEW_WEBKITGTK_API=6.0 \
            -DWEBVIEW_ENABLE_CHECKS=false \
            -DCMAKE_TOOLCHAIN_FILE=cmake/toolchains/host-llvm.cmake \
            -DWEBVIEW_USE_CLANG_TIDY=OFF \
            -DWEBVIEW_BUILD_DOCS=OFF \
            -DWEBVIEW_USE_CLANG_FORMAT=OFF`;
    await $`cmake --build build`;
    await $`cp build/core/libwebview.so ../build/libwebview.${Deno.build.arch}.so`;
    await $`strip ../build/libwebview.${Deno.build.arch}.so`;
    break;
  }
  case "darwin": {
    $.cd("webview");
    await $`cmake -G "Ninja Multi-Config" -B build -S . \
            -DCMAKE_BUILD_TYPE=Release \
            -DWEBVIEW_BUILD_TESTS=OFF \
            -DWEBVIEW_BUILD_EXAMPLES=OFF \
            -DWEBVIEW_USE_CLANG_TOOLS=OFF \
            -DWEBVIEW_ENABLE_CHECKS=OFF \
            -DWEBVIEW_USE_CLANG_TIDY=OFF \
            -DWEBVIEW_BUILD_DOCS=OFF \
            -DWEBVIEW_USE_CLANG_FORMAT=OFF \
            -DWEBVIEW_CLANG_FORMAT_EXE=${await findClangFormat()}`;
    await $`cmake --build build --config Release`;
    await $`cp build/core/Release/libwebview.dylib ../build/libwebview.${Deno.build.arch}.dylib`;
    await $`strip -x -S ../build/libwebview.${Deno.build.arch}.dylib`;
    break;
  }
}
