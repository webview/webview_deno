# deno_webview
[![license](https://img.shields.io/github/license/eliassjogreen/deno_webview)](https://github.com/eliassjogreen/deno_webview/blob/master/LICENSE)
[![stars](https://img.shields.io/github/stars/eliassjogreen/deno_webview)](https://github.com/eliassjogreen/deno_webview/stargazers)
[![ci](https://github.com/eliassjogreen/deno_webview/workflows/ci/badge.svg)](https://github.com/eliassjogreen/deno_webview/actions)
[![GitHub Releases](https://img.shields.io/github/downloads/eliassjogreen/deno_webview/latest/total)](https://github.com/eliassjogreen/deno_webview/releases/latest/)

Still in a early stage of development. `deno_webview` uses the [rust bindings](https://github.com/Boscop/web-view) for [zserge's webview](https://github.com/zserge/webview).

![Example image](images/deno_webview.png)

## Example
Run the following with the `-A` flag enabled to get the example shown above:
```ts
import { WebView } from "https://deno.land/x/webview/mod.ts";

const webview = new WebView({
    title: "Hello world",
    url: `data:text/html,
    <html>
    <body>
      <h1>Hello from deno</h1>
    </body>
    </html>
    `
});

webview.run();
```

## Todo
- [x] Implement ~~all~~ most webview [instance methods](https://docs.rs/web-view/0.6.0/web_view/struct.WebView.html)
- [x] Update ci so building with Edge works
- [ ] Two-way deno bindings (to call deno from javascript)
- [ ] Multiple windows/instances? (Help, need to create a static HashMap of `*mut CWebView`)
- [ ] Easier importing of scripts, images and css
- [ ] Dialog
- [ ] DialogBuilder and WebViewBuilder
- [ ] Examples
- [ ] Tests
- [ ] Wait for the [rust bindings](https://github.com/Boscop/web-view) to update to the latest [webview](https://github.com/zserge/webview) version.
    - [ ] Polyfill for new API?
- [ ] Docs
