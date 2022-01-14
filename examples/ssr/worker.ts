import { Webview } from "../../mod.ts";
const webview = new Webview();

webview.navigate("http://localhost:8000/");
onmessage = (event) => {
  if (event.data === "close") {
    webview.terminate();
    self.close();
  }
};

webview.run();
