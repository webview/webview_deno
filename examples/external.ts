import { Webview } from "../mod.ts";

const html = `
  <html>
  <body>
    <button onclick="external.invoke('A')">A</button>
    <button onclick="external.invoke('B')">B</button>
    <button onclick="external.invoke('C')">C</button>
  </body>
  </html>
`;

const webview = new Webview();
webview.navigate(`data:text/html,${encodeURIComponent(html)}`);
for await (const event of webview.iter()) {
  webview.title = event;
}

// await webview.run((event) => webview.setTitle(event));
