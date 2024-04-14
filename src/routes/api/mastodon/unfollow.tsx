import { FreshContext, Handlers, STATUS_CODE } from "$fresh/server.ts"
import { getToken, unfollowAccount } from "../../../plugins/mastodon_api.ts"
import { StateData } from "../../../types/StateData.ts"

// noinspection JSUnusedGlobalSymbols
export const handler: Handlers = {
  async GET(req: Request, ctx: FreshContext): Promise<Response> {
    const id = ctx.url.searchParams.get("id") || ""

    if (id === "") {
      return new Response(JSON.stringify({ error: "No ID specified" }), { status: STATUS_CODE.BadRequest })
    }

    const currentData = ctx.state.data as StateData
    const activeServer = currentData?.activeServer
    const user = currentData.user
    const oauthToken = getToken(req)

    if (activeServer && user) {
      const followResult = await unfollowAccount(oauthToken, activeServer, id)
      if (followResult.success) {
        return new Response(JSON.stringify(followResult.relationship), { status: STATUS_CODE.OK })
      }
      const errorMessage = JSON.stringify(followResult.error) || JSON.stringify({ error: "Unable to process request" })
      return new Response(errorMessage, { status: followResult.status })
    }

    return new Response("Unauthorized", { status: STATUS_CODE.Unauthorized })
  }
}
