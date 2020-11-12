import { Webview, SizeHint } from "../mod.ts";

const html = `
  <html>
    <body>
      <h1>Hello from deno v${Deno.version.deno}</h1>
    </body>
  </html>
`;

const webview = new Webview();
webview.url = `data:text/html,${encodeURIComponent(html)}`;
webview.title = "webview_deno";
webview.size = {
  width: 400,
  height: 600,
  hint: SizeHint.Min
};
webview.run();
