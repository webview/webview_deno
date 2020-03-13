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
