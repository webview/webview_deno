import { Webview } from "../../mod.ts";
import { unload } from "../../plugin.ts";

const html = `
  <html>
  <body>
    <h1>Hello from deno worker!</h1>
  </body>
  </html>
`;

const webview = new Webview(
  { url: `data:text/html,${encodeURIComponent(html)}` },
);

onmessage = (event) => {
  if (event.data === "close") {
    webview.drop();
    unload();
    self.close();
  }
};

webview.run();
