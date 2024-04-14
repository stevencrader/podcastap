import { getSuccessUrl } from "$deno_kv_oauth/lib/_http.ts"
import { signIn } from "$deno_kv_oauth/mod.ts"
import { FreshContext, Handlers, STATUS_CODE } from "$fresh/server.ts"
import { getActiveServer, getOAuthConfig } from "../../plugins/kv_oauth.ts"
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

    try {
      const config = await getOAuthConfig(server)
      return await signIn(req, config)
    } catch (e) {
      const returnUrl = new URL(getSuccessUrl(req))
      returnUrl.searchParams.set("error", `Unable to sign in: ${e}`)
      return new Response(null, {
        headers: {
          location: returnUrl.toString()
        },
        status: STATUS_CODE.TemporaryRedirect
      })
    }
  }
}
