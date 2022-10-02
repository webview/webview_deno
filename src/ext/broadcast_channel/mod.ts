import { Webview } from "../../webview.ts";
import { __broadcast_patch } from "./patch.ts";

export function register(webview: Webview) {
  webview.bind("__broadcast_subscribe", () => {

  });
  
  webview.bind("__broadcast_unsubscribe", () => {
    
  });
  
  webview.bind("__broadcast_send", () => {
    
  });

  webview.bind("__broadcast_recv", () => {
    return [ "name", "data" ];
  });

  webview.init(__broadcast_patch.toString() + "\n__broadcast_patch();");
}
