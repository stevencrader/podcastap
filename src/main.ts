/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

import "@std/dotenv/load"

import { start } from "$fresh/server.ts"
import { freshSEOPlugin } from "$fresh_seo/mod.ts"
import config from "./fresh.config.ts"

import manifest from "./fresh.gen.ts"

if (config.plugins === undefined) {
  config.plugins = []
}

config.plugins.push(freshSEOPlugin(manifest, {
  exclude: [
    "/auth/**",
    "/api/**"
  ]
}))

console.log(config)

await start(manifest, config)
