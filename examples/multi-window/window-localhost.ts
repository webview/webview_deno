import { Webview } from "../../mod.ts";

const webview = new Webview();

postMessage("open");

webview.navigate("http://localhost:8000");

webview.bind("close", () => {
  postMessage("close");
  self.close();
});

addEventListener(
  "onmessage",
  (evt) =>
    (evt as MessageEvent).data === "unload" ? webview.terminate() : void 0,
);

webview.run();
