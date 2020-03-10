# deno_webview

Still in a *very* early stage of development. Lots of stuff to do and not even
the basics are really implemented yet (apart from opening a webview window).
`deno_webview` uses the [rust bindings](https://github.com/Boscop/web-view) for
[zserge's webview](https://github.com/zserge/webview).

![Example image](images/deno_webview.png)

## Todo
- [ ] Implement all webview [instance methods](https://docs.rs/web-view/0.6.0/web_view/struct.WebView.html)
- [ ] Two-way deno bindings (to call deno from javascript)
- [ ] Multiple windows?
- [ ] Easier importing of scripts, images and css
- [ ] Dialog
- [ ] DialogBuilder and WebViewBuilder
- [ ] Examples
- [ ] Tests
