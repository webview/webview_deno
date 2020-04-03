import { WebView } from "../mod.ts";

await new WebView({
  title: "User agent deno_webview example",
  url: `data:text/html,
      <html>
      <body>
        <h1 id="h1">2 Nav</h1>
        <script>document.body.innerHTML = window.navigator.userAgent;</script>
      </body>
      </html>
      `,
  width: 800,
  height: 600,
  resizable: true,
  debug: false,
  frameless: false,
}).run();
