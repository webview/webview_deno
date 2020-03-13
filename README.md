# deno_webview
[![license](https://img.shields.io/github/license/eliassjogreen/deno_webview)](https://github.com/eliassjogreen/deno_webview/blob/master/LICENSE)
[![stars](https://img.shields.io/github/stars/eliassjogreen/deno_webview)](https://github.com/eliassjogreen/deno_webview/stargazers)
[![ci](https://github.com/eliassjogreen/deno_webview/workflows/ci/badge.svg)](https://github.com/eliassjogreen/deno_webview/actions)
[![GitHub Releases](https://img.shields.io/github/downloads/eliassjogreen/deno_webview/latest/total)](https://github.com/eliassjogreen/deno_webview/releases/latest/)
[![Deno version](https://img.shields.io/badge/deno-0.36.0-success)](https://github.com/denoland/deno)

Still in a early stage of development. `deno_webview` uses the [rust bindings](https://github.com/Boscop/web-view) for [zserge's webview](https://github.com/zserge/webview).

![Example image](images/deno_webview.png)

## Example
Run the following with the `-A` flag enabled to get the example shown above:
```ts
import { WebView } from "./mod.ts";

const webview1 = new WebView({
    title: "Hello world",
    url: `data:text/html,
    <html>
    <body>
      <h1>Hello from deno</h1>
    </body>
    </html>
    `,
    width: 300,
    height: 300,
    frameless: true
});

const webview2 = new WebView({
    title: "Hello world 2",
    url: `data:text/html,
  <html>
  <body>
    <h1>Hello from deno 2</h1>
  </body>
  </html>
  `,
  width: 300,
  height: 300
});

while (webview1.step() && webview2.step()) {}

```
or just run the following in the terminal:
```
deno -A https://deno.land/x/webview/example.ts
```

## Docs
Docs can be found [here](https://deno.land/x/webview/mod.ts?doc).

## Todo
- [x] Implement ~~all~~ most webview [instance methods](https://docs.rs/web-view/0.6.0/web_view/struct.WebView.html)
- [x] Docs
- [x] Multiple windows/instances? ~~(Help, need to create a static HashMap of `*mut CWebView`)~~ Used solution found [here](https://github.com/crabmusket/deno_sqlite_plugin/blob/2df9e495f34d246881de0b48c9c79cc9e271abeb/src/lib.rs#L18)
- [ ] Better errors and responses from rust land
- [ ] Update ci so building with Edge works #3
- [ ] Two-way deno bindings (to call deno from javascript)
- [ ] More examples
- [ ] Tests
- [ ] Wait for the [rust bindings](https://github.com/Boscop/web-view) to update to the latest [webview](https://github.com/zserge/webview) api.
    - [ ] Polyfill for new API?
