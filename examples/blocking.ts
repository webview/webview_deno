import { WebView } from "../mod.ts";

const html = `
  <html>
  <body>
    <h1>Hello from deno</h1>
  </body>
  </html>
`;

const webview = new WebView({
  title: "Local webview_deno example",
  url: `data:text/html,${encodeURIComponent(html)}`,
  width: 800,
  height: 600,
  resizable: true,
  debug: true,
  frameless: false,
});

setTimeout(() => {
  console.log("Print from timeout after running");
}, 1000);

webview.run();

console.log("Print from top level after running");
