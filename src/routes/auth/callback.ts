import { handleCallback, Tokens } from "$deno_kv_oauth/mod.ts"
import { FreshContext, Handlers, STATUS_CODE } from "$fresh/server.ts"
import { setCookie } from "@std/http/cookie"
import { buildCookie, getActiveServer, getOAuthConfig, TOKEN_COOKIE_NAME } from "../../plugins/kv_oauth.ts"
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

    const config = await getOAuthConfig(server)
    if (config === null) {
      console.error(`Unable to create oauth client`)
      throw new Error("Unable to sign in")
    }

    const {
      response,
      // sessionId,
      tokens
    } = await handleCallback(req, config) as {
      response: Response
      sessionId: string
      tokens: Tokens
    }

    if (tokens) {
      const token = tokens.accessToken
      const cookie = buildCookie(ctx.url.toString(), TOKEN_COOKIE_NAME, token)
      setCookie(response.headers, cookie)
    }

    return response
  }
}
