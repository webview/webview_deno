import { Webview } from "../mod.ts";

const html = `
  <html>
  <body>
  <button onclick="external.invoke('test')">test</button>
    <script>
      function test() { external.invoke("finish"); }
    </script>
  </body>
  </html>
`;

const webview = new Webview();
webview.navigate(`data:text/html,${encodeURIComponent(html)}`);

await webview.run();
