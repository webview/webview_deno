import { Webview } from "../mod.ts";

const html = `
  <html>
  <body>
    <h1>Hello from deno v${Deno.version.deno}</h1>
    <button onclick="press('I was pressed!', 123, new Date()).then(log);">
      Press me!
    </button>
  </body>
  </html>
`;

const webview = new Webview();

webview.navigate(`data:text/html,${encodeURIComponent(html)}`);

let counter = 0;
webview.bind("press", (a, b, c) => {
  console.log(a, b, c);

  return { times: counter++ };
});

webview.bind("log", (...args) => console.log(...args));

webview.run();
