import { getCookieName, isHttps } from "$deno_kv_oauth/lib/_http.ts"
import { signOut } from "$deno_kv_oauth/mod.ts"
import { FreshContext, Handlers, STATUS_CODE } from "$fresh/server.ts"
import { deleteCookie } from "https://deno.land/std@0.213.0/http/cookie.ts"
import { getActiveServer, TOKEN_COOKIE_NAME } from "../../plugins/kv_oauth.ts"
import { getToken } from "../../plugins/mastodon_api.ts"
import { StateData } from "../../types/StateData.ts"

// noinspection JSUnusedGlobalSymbols
export const handler: Handlers = {
  async GET(req: Request, ctx: FreshContext): Promise<Response> {
    let server = (ctx.state.data as StateData).activeServer
    if (server === undefined || server === "") {
      server = getActiveServer(req)
    }

    if (server === undefined || server === "") {
      return new Response(null, {
        headers: {
          location: "/"
        },
        status: STATUS_CODE.TemporaryRedirect
      })
    }

    // check for prior oauth token
    const oauthToken = getToken(req)

    const response = await signOut(req)
    if (oauthToken) {
      const cookieName = getCookieName(TOKEN_COOKIE_NAME, isHttps(req.url))
      deleteCookie(response.headers, cookieName)
    }
    return response
  }
}
