import { WebView } from "../mod.ts";

const html = `
  <html>
  <body>
    <script>document.body.innerHTML = window.navigator.userAgent;</script>
  </body>
  </html>
`;

await new WebView({
  title: "User agent deno_webview example",
  url: `data:text/html,${encodeURIComponent(html)}`,
  width: 800,
  height: 600,
  resizable: true,
  debug: false,
  frameless: false,
}).run();
