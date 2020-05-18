import { WebView } from "../mod.ts";

// DOES NOT WORK YET

const html = `
  <html>
  <body>
    <h1>asdasdasd</h1>
    <script>
      external.invoke("hello from window");
    </script>
  </body>
  </html>
`;

await new WebView({
  title: "External deno_webview example",
  url: `data:text/html,${encodeURIComponent(html)}`,
  width: 800,
  height: 600,
  resizable: true,
  debug: true,
  frameless: false,
}).run();
