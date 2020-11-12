# webview_deno

[![stars](https://img.shields.io/github/stars/webview/webview_deno?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAEFCu8CAAAABGdBTUEAALGPC/xhBQAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAHKADAAQAAAABAAAAHAAAAABHddaYAAABxElEQVRIDe2Wv04CQRDGAQuoTKQ2ITyADZWVJZWV+gJYWBNqKh/C16CRBlprWxsTE2NJfABNOH9z7Gzm2Nv7A8TCOMnHzs1838ze3e4ejUbMkiRZS64lP1x8MjTFr2DQE6Gl2nI+7POARXAmdbas44ku8eLGhU9UckRliX6qxM9sQvz0vrcVaaKJKdsSNO7LOtK1kvcbaXVRu4LMz9kgKoYwBq/KLBi/yC2DQgSnBaLMQ88Tx7Q3AVkDKHpgBdoak5HrCSjuaAW/6zOz+u/Q3ZfcVrhliuaPYCAqsSJekIO/TlWbn2BveAH5JZBVUWayusZW2ClTuPzMi6xTIp5abuBHxHLcZSyzkxHF1uNJRrV9gXBhOl7h6wFW/FqcaGILEmsDWfg9G//3858Az0lWaHhm5dP3i9JoDtTm+1UrUdMl72OZv10itfx3zOYpLAv/FPQNLvFj35Bnco/gzeCD72H6b4JYaDTpgidwaJOa3bCji5BsgYcDdJUamSMi2lQTCEbgu0Zz4Y5UX3tE3K/RTKny3qNWdst3UWU8sYtmU40py2Go9o5zC460l/guJjm1leZrjaiH4B4cVxUK12mGVTV/j/cDqcFClUX01ZEAAAAASUVORK5CYII=)](https://github.com/webview/webview_deno/stargazers)
[![issues](https://img.shields.io/github/issues/webview/webview_deno?logo=github)](https://github.com/webview/webview_deno/issues)
[![ci](https://img.shields.io/github/workflow/status/webview/webview_deno/ci?logo=github)](https://github.com/webview/webview_deno/actions)
[![downloads](https://img.shields.io/github/downloads/webview/webview_deno/total?logo=github)](https://github.com/webview/webview_deno/releases/latest/)
[![deno version](https://img.shields.io/badge/deno-^1.2.0-informational?logo=deno)](https://github.com/denoland/deno)
[![deno doc](https://img.shields.io/badge/deno-doc-informational?logo=deno)](https://doc.deno.land/https/deno.land/x/webview/mod.ts)
[![license](https://img.shields.io/github/license/webview/webview_deno?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAEFCu8CAAAABGdBTUEAALGPC/xhBQAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAHKADAAQAAAABAAAAHAAAAABHddaYAAAC5UlEQVRIDd2WPWtVQRCGby5pVASLiGghQSxyG8Ui2KWwCfkH9olY2JneQkiR0oCIxH/gB+qVFDYBIWBAbAIRSbCRpLXwIxLiPT7vnNm9e87ZxJtUwYH3zO47Mzv7Mbv3tlo5KYriGtgAJ81OY1ENdG/YI4boFEOI911BXgY/pdtwGuAtXpvmB1tAXHDnUolE5urkPOQo6MqA3pXWmJJL4Bb4rQ7yEYfxsjnIF29NJIoNC6e5fxOL/qN+9KCz7AaLpN8zI415N2i2EptpGrkRIjGeAuvR6IY1hSFLFUOug9Ms2M7ZxIUNytm1mnME186sdI2BOCwAyQMg54ugzSmKmwbPwSbolKH+hbAtQdsOoF+BsF3anUVwBdiOWRidFZDKTTrKEAJTm3GVrGkHzw/uPZbyx7DNNLfB7KGmRsCcr+/gjaiPSpAOTyX9qG4L/XBDdWXDDf1M+wtQ5fwCOtcb4Dto6VpLmzByB6gqdHbTItGSJdAGqibJQhmRfCF7IN4beSF2G9CqnGXQrxofXU+EykllNeoczRgYytDKMubDIRK0g5MF8rE69cGu0u9nlUcqaUZ41W0qK2nGcSzr4D2wV9U9wxp1rnpxn8agXAOHMQ9cy9kbHM7ngY4gFb03TxrO/yfBUifTtXt78jCrjY/jgEFnMn45LuNWUtknuu7NSm7D3QEn3HbatV1Q2jvgIRf1sfODKQaeymxZoMLlTqsq1LF+HvaTqQOzEzUCfni0/eNIA+DfuE3KEtbsegckGmMktTXacnBHPVe687ugkpT+axCkkhBSyRSjWI2xf1KMMVmYiQdWksK9BEFiQoiYLIlvJA3/zeTzCejP0RbB6YPbhZuB+0pR3KcdX0LaJtju0ZgBL8Bd+sbz2QIaU2OfBX3BaQLsgZysQtrk0M8Sh1A0w3DyyYnGnAiZ4gqZ/TvI2A8OGd1YIbF7+F3P+B6dYpYdsJNZgrjO0UdOIhmom0nwL0pnfnzkL1803jAoKhvyAAAAAElFTkSuQmCC)](https://github.com/webview/webview_deno/blob/master/LICENSE)


[deno](https://github.com/denoland/deno) bindings for
[webview](https://github.com/zserge/webview) using the
[webview_rust](https://github.com/Boscop/web-view). 
Webview is a tiny cross-platform library to render **web-based GUIs for desktop applications**.

---
> ⚠️ This project is still in an early stage of development. Expect breaking changes.
---

![Example Image](images/webview_deno.png)

## Example

```typescript
import { Webview } from "https://deno.land/x/webview/mod.ts";

const html = `
  <html>
  <body>
    <h1>Hello from deno</h1>
  </body>
  </html>
`;

await new Webview({
  title: "Local webview_deno example",
  url: `data:text/html,${encodeURIComponent(html)}`,
  height: 600,
  resizable: true,
  debug: true,
  frameless: false,
}).run();
```

you can run this example directly from the web:

```bash
$ deno run -A -r --unstable https://deno.land/x/webview/examples/local.ts
```

or in your development environment:

```bash
$ deno run -A -r --unstable app.ts
```

you can find other examples in the [`example/`](examples) directory.

## Documentation

You can find the official documentation
[here](https://doc.deno.land/https/deno.land/x/webview/mod.ts).

## Development

### Prerequisites

For building webview_deno the same
[prerequisites](https://deno.land/std/manual.md#prerequisites) as for building
deno is required.

#### Linux dependencies

- [webkit2gtk](https://webkitgtk.org/) (to install using apt:
  `sudo apt-get install libwebkit2gtk-4.0-dev`)

### Building

Building webview_deno can take a nontrivial amount of time depending on your operating system.
After the first build most files will be cached so building time will be reduced.
Building on Windows requires admin privileges.

For a default build you can use the provided script:

```
deno run -A scripts/build.ts
```

which internally runs: 

optionally you can use **mshtml**:

```
deno run -A scripts/build.ts mshtml
```

### Running

To run webview_deno without automatically downloading the binaries from
[releases](https://github.com/webview/webview_deno/releases) you will need
to use the environment variable `WEBVIEW_DENO_PLUGIN` and set it to the path where the 
built binaries are located. This is usually `file://./target/release`. 
The process of running and using local binaries can be easier to using the
[dev script](https://github.com/webview/webview_deno/tree/master/scripts/dev.ts):

```
deno -A scripts/dev.ts [example.ts]
```

## Environment variables

-   `WEBVIEW_DENO_PLUGIN` - The URL of the plugin  
    Due to MSHTML (ie) no longer being enabled by default, the only way to enable it is to set the `WEBVIEW_DENO_PLUGIN` variable to the path of a binary
    build built with the `--no-default-features` flag or using
    `deno -A scripts/build.ts mshtml`
-   `WEBVIEW_DENO_PLUGIN_BASE` - The URL of the plugin except the last part. Ignored if `WEBVIEW_DENO_PLUGIN` is set.  
    When developing locally `WEBVIEW_DENO_PLUGIN_BASE` should be set to the directory containing the plugin binary, usually `file://./target/release`. Otherwise, don't set this.
-   `WEBVIEW_DENO_DEBUG` - Disable cache and enable logs for `plug`. Used for debugging.

## Dependencies

### Deno

- [plugin_prepare](https://deno.land/x/plugin_prepare)

### Rust

- [deno_core](https://crates.io/crates/deno_core)
- [webview-sys](https://crates.io/crates/webview-sys)
- [serde](https://crates.io/crates/serde)
- [serde_json](https://crates.io/crates/serde_json)

## Other

### Contribution

Pull request, issues and feedback are very welcome. Code style is formatted with `denon fmt`
(which internally runs `deno fmt` and `cargo fmt`) and commit messages are done following 
[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) spec.

### Licence

Copyright 2020-present, the webview_deno team. All rights reserved. MIT license.
