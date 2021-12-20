const lib = Deno.dlopen("./webview/libwebview.so", {
  "webview_create": {
    parameters: ["i32", "pointer"],
    result: "pointer",
  },
  "webview_destroy": {
    parameters: ["pointer"],
    result: "void",
  },
  "webview_run": {
    parameters: ["pointer"],
    result: "void",
  },
  "webview_terminate": {
    parameters: ["pointer"],
    result: "void",
  },
  "webview_dispatch": {
    parameters: ["pointer", "pointer", "pointer"],
    result: "void",
  },
  "webview_set_title": {
    parameters: ["pointer", "pointer"],
    result: "void",
  },
  "webview_get_window": {
    parameters: ["pointer"],
    result: "pointer",
  },
  "webview_set_size": {
    parameters: ["pointer", "i32", "i32", "i32"],
    result: "void",
  },
  "webview_navigate": {
    parameters: ["pointer", "pointer"],
    result: "void",
  },
  "webview_eval": {
    parameters: ["pointer", "pointer"],
    result: "void",
  },
  "webview_init": {
    parameters: ["pointer", "pointer"],
    result: "void",
  },
  "webview_bind": {
    parameters: ["pointer", "pointer", "pointer", "pointer"],
    result: "void",
  },
  "webview_return": {
    parameters: ["pointer", "pointer", "pointer", "pointer"],
    result: "void",
  },
});

export default lib;
