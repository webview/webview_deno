import { Webview } from "../mod.ts";

const html = `
  <html>
  <body>
    <button onclick="setTitle('A')">A</button>
    <button onclick="setTitle('B')">B</button>
    <button onclick="setTitle('C')">C</button>
  </body>
  </html>
`;

const webview = new Webview();
webview.bind("setTitle", (title: string) => {
  webview.setTitle(title);
});
webview.navigate(`data:text/html,${encodeURIComponent(html)}`);

await webview.run();
