import { WebView } from "./mod.ts";

const webview = new WebView({
    title: "Hello world",
    url:
        "data:text/html," +
        `
    <html>
    <body>
      <h1>Hello from deno</h1>
    </body>
    </html>
    `
});

webview.run();
