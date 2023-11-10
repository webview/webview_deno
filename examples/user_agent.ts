import { Webview } from "../mod.ts";

const html = `
  <html>
  <body>
    <script>document.body.innerHTML = window.navigator.userAgent; </script>
  </body>
  </html>
`;

const webview = new Webview();

webview.html = html;

webview.run();
