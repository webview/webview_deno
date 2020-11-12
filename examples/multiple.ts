import { Webview } from "../mod.ts";

const html = (n: number) =>
  `
  <html>
  <body>
    <h1>${n}</h1>
    <h2>Hello from deno v${Deno.version.deno}</h2>
  </body>
  </html>
`;

const webview1 = new Webview({
  title: "Multiple webview_deno example",
  url: `data:text/html,${encodeURIComponent(html(1))}`,
  width: 400,
  height: 200,
  resizable: true,
  debug: true,
  frameless: false,
});

const webview2 = new Webview({
  title: "Multiple webview_deno example",
  url: `data:text/html,${encodeURIComponent(html(2))}`,
  width: 400,
  height: 200,
  resizable: true,
  debug: true,
  frameless: false,
});

await Promise.all([webview1.run(), webview2.run()]);
