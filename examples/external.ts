import { WebView } from "../mod.ts";

// ffi_invoke_handler crashed the program when `external.invoke("hello from window");` is called

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
