import { Webview } from "../../mod.ts";

const html = `
  <html>
  <body>
    <h1>Hello from deno worker!</h1>
  </body>
  </html>
`;

const webview = new Webview();
webview.navigate(`data:text/html,${encodeURIComponent(html)}`)

onmessage = (event) => {
  if (event.data === "close") {
    webview.terminate();
    self.close();
  }
};

webview.run();
