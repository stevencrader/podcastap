import { FreshContext } from "$fresh/server.ts"
import { getServerUrls } from "../plugins/db.ts"
import { getActiveServer, verifyUser } from "../plugins/kv_oauth.ts"
import { StateData } from "../types/StateData.ts"

// noinspection JSUnusedGlobalSymbols
export async function handler(req: Request, ctx: FreshContext) {
  if (ctx.destination === "internal" || ctx.destination === "static") {
    return ctx.next()
  }

  const activeServer = getActiveServer(req)
  ctx.state.data = {
    ...(ctx.state.data as StateData),
    activeServer
  } as StateData

  if (activeServer === undefined) {
    return ctx.next()
  }

  // don't get user info for api and auth pages
  if (
    (
      ctx.url.pathname.startsWith("/auth") ||
      (
        ctx.url.pathname.startsWith("/api") &&
        !ctx.url.pathname.startsWith("/api/mastodon") &&
        !ctx.url.pathname.startsWith("/api/lookup")
      )
    ) &&
    ctx.destination !== "notFound"
  ) {
    return ctx.next()
  }

  const validUser = await verifyUser(req, activeServer)
  const signedIn = validUser.user !== undefined
  ctx.state.data = {
    ...(ctx.state.data as StateData),
    user: validUser.user,
    signedIn
  } as StateData

  if (!signedIn || ctx.url.pathname.startsWith("/legal")) {
    console.log("Getting server urls", req.url)
    const servers = await getServerUrls()
    ctx.state.data = {
      ...(ctx.state.data as StateData),
      servers
    } as StateData
  }

  const response = await ctx.next()
  const { ok } = response
  if (ok) {
    if (!validUser.success) {
      validUser.headers.forEach((value, name) => {
        response.headers.set(name, value)
      })
    }
  }
  return response
}
