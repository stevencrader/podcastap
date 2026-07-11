import { type Hackle, makeHackle } from "https://deno.land/x/hackle@1.1.1/mod.ts"

declare global {
  var print: Hackle["debug"]
  var hackle: Hackle
}

const g = globalThis as typeof globalThis & {
  hackle?: Hackle
  print?: Hackle["debug"]
}

if (!g.hackle) g.hackle = makeHackle()
if (!g.print) g.print = g.hackle.debug
