import * as Plugin from "../plugin.ts";

const {id} = Plugin.WebviewCreate({
    debug: false
});

console.log(id);

Plugin.WebViewRun({
    id: 0
});
