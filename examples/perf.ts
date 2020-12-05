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

const webview = new Webview(
  { url: `data:text/html,${encodeURIComponent(html)}` },
);

await webview.run((event) => {  
  switch(event) {
    case "test":
      console.time();
      webview.eval("test();");
      break;
    case "finish":
      console.timeEnd();
      break;
  }
});
