import { FreshContext, Handlers, STATUS_CODE } from "$fresh/server.ts"
import { followAccount, getToken, searchAndVerifyAccount } from "../../../plugins/mastodon_api.ts"
import { StateData } from "../../../types/StateData.ts"

// noinspection JSUnusedGlobalSymbols
export const handler: Handlers = {
  async GET(req: Request, ctx: FreshContext): Promise<Response> {
    const id = ctx.url.searchParams.get("id") || ""
    const lookup = ctx.url.searchParams.get("lookup") === "true"

    if (id === "") {
      return new Response(JSON.stringify({ error: "No ID specified" }), { status: STATUS_CODE.BadRequest })
    }

    let accountId = id
    const currentData = ctx.state.data as StateData
    const activeServer = currentData?.activeServer
    const signedIn = currentData.signedIn

    if (activeServer && signedIn) {
      const oauthToken = getToken(req)

      // lookup account first
      if (lookup) {
        const username = `${id}@ap.podcastindex.org`
        const accountResult = await searchAndVerifyAccount(oauthToken, activeServer, `@${username}`, username, true)
        if (accountResult.success && accountResult.account) {
          accountId = accountResult.account.id
        }
      }

      const followResult = await followAccount(oauthToken, activeServer, accountId)
      if (followResult.success) {
        return new Response(JSON.stringify(followResult.relationship), { status: STATUS_CODE.OK })
      }
      const errorMessage = JSON.stringify(followResult.error) || JSON.stringify({ error: "Unable to process request" })
      return new Response(errorMessage, { status: followResult.status })
    }

    return new Response("Unauthorized", { status: STATUS_CODE.Unauthorized })
  }
}
