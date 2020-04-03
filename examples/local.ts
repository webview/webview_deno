import { WebView } from "../mod.ts";

await new WebView({
  title: "Local deno_webview example",
  url: `data:text/html,
    <html>
    <body>
      <h1>Hello from deno</h1>
    </body>
    </html>
    `,
  width: 800,
  height: 600,
  resizable: true,
  debug: true,
  frameless: false,
}).run();
