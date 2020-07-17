import { WebView } from "../mod.ts";

// DOES NOT WORK YET

const html = `
  <html>
  <body>
    <h1>Hello from deno v${Deno.version.deno}</h1>
    <script>
      external.invoke("hello from window");
    </script>
  </body>
  </html>
`;

await new WebView({
  title: "External webview_deno example",
  url: `data:text/html,${encodeURIComponent(html)}`,
  width: 800,
  height: 600,
  resizable: true,
  debug: true,
  frameless: false,
}).run();
