import { WebviewBuilder } from "../mod.ts";

const builder = new WebviewBuilder();
builder.title("Hello World");
builder.width(300);
builder.height(400);
builder.url("https://google.com");

const view = builder.build();
await view.run();
