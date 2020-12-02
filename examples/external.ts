import { Webview } from "../mod.ts";

const html = `
  <html>
  <body>
    <button onclick="external.invoke('A')">A</button>
    <button onclick="external.invoke('B')">B</button>
    <button onclick="external.invoke('C')">C</button>
  </body>
  </html>
`;

const webview = new Webview(
  { url: `data:text/html,${encodeURIComponent(html)}` },
);

const interval = setInterval(() => {
  const success = webview.loop();
  const events = webview.step();

  if (events.length > 0) {
    console.log(events);
  }

  if (!success) {
    clearInterval(interval);
  }
}, 1000 / 60);
