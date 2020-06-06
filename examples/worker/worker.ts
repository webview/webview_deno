import { WebView } from "../../mod.ts";
import { unload } from "../../plugin.ts";

const html = `
  <html>
  <body>
    <h1>Hello from deno worker!</h1>
  </body>
  </html>
`;

const webview = new WebView({
  title: "Worker deno_webview example",
  url: `data:text/html,${encodeURIComponent(html)}`,
  width: 800,
  height: 600,
  resizable: true,
  debug: true,
  frameless: false,
});

webview.run();

onmessage = (event) => {
  if (event.data === "close") {
    webview.exit();
    unload();
    self.close();
  }
};
