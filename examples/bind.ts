import { Webview } from "../mod.ts";

const html = `
  <html>
  <body>
    <h1>Hello from deno v${Deno.version.deno}</h1>
  </body>
  </html>
`;

const webview = new Webview();

webview.navigate(`data:text/html,${encodeURIComponent(html)}`);

webview.bind("test", (seq, req) => {
  console.log(123);
});

setTimeout(() => webview.eval("test({a: 123}, 123, new Date());"), 1000);
setTimeout(() => webview.eval("test({a: 123}, 123, new Date());"), 2000);

await webview.run();
