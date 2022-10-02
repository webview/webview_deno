import { Webview } from "../../mod.ts";
import { register } from "../../src/ext/broadcast_channel/mod.ts";

const html = `
  <html>
  <body>
    <h1>Hello from deno v${Deno.version.deno}</h1>
    <script>
      const b = new BroadcastChannel("test");
      console.log(b);
    </script>
  </body>
  </html>
`;

const webview = new Webview();

register(webview);

webview.navigate(`data:text/html,${encodeURIComponent(html)}`);
webview.run();
