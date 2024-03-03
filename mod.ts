/**
 * Webview is a tiny cross-platform library to make web-based GUIs for desktop
 * applications.
 *
 * @example
 * ```
 * import { Webview } from "@webview/webview";
 *
 * const html = `
 *   <html>
 *   <body>
 *     <h1>Hello from deno v${Deno.version.deno}</h1>
 *   </body>
 *   </html>
 * `;
 *
 * const webview = new Webview();
 *
 * webview.navigate(`data:text/html,${encodeURIComponent(html)}`);
 * webview.run();
 * ```
 *
 * @module
 */

export * from "./src/webview.ts";
export { preload, unload } from "./src/ffi.ts";
