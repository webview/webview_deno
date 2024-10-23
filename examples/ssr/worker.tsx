/** @jsx h */
/// <reference no-default-lib="true"/>
/// <reference lib="dom" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import { serve } from "https://deno.land/std@0.157.0/http/server.ts";
// deno-lint-ignore verbatim-module-syntax
import { h, ssr, tw } from "https://crux.land/nanossr@0.0.1";

const Hello = (props: { name: string }) => (
  <div class={tw`bg-white flex h-screen`}>
    <h1 class={tw`text-5xl text-gray-600 m-auto mt-20`}>
      Hello {props.name}!
    </h1>
  </div>
);

const server = serve((req) => {
  console.log(req);
  const url = new URL(req.url);
  const name = url.searchParams.get("name") ?? "world";
  return ssr(() => <Hello name={name} />);
}, { port: 8000 });

console.log("[runner] Listening on http://localhost:8000");
await server;
