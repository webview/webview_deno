import { WebView } from "../mod.ts";

// DOES NOT WORK YET

await new WebView({
  title: "External deno_webview example",
  url: `data:text/html,
    <html>
    <body>
      <h1>asdasdasd</h1>
      <script>
        onload = () => {
          external.invoke("hello from window");
        }
      </script>
    </body>
    </html>
    `,
  width: 800,
  height: 600,
  resizable: true,
  debug: true,
  frameless: false,
}).run();
