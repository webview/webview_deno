import { Webview } from "../mod.ts";

const html = `
  <html>
  <body>
    <h1>Hello from deno v${Deno.version.deno}</h1>
  </body>
  </html>
`;

const webview = new Webview(
  { url: `data:text/html,${encodeURIComponent(html)}` },
);

setTimeout(() => {
  console.log("Print from timeout after running");
}, 1000);

const promise = webview.run();

console.log("Print from top level after running");

// await closing of webview
await promise;
