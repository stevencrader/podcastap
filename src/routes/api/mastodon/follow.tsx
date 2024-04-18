import { FreshContext, Handlers, STATUS_CODE } from "$fresh/server.ts"
import { followAccount, getToken, searchAndVerifyAccount } from "../../../plugins/mastodon_api.ts"
import { StateData } from "../../../types/StateData.ts"
import { getAPBridgeUsername } from "../../../utils/ap_user.ts"

// noinspection JSUnusedGlobalSymbols
export const handler: Handlers = {
  async GET(req: Request, ctx: FreshContext): Promise<Response> {
    const id = ctx.url.searchParams.get("id") || ""
    let username = ctx.url.searchParams.get("username") || ""
    const lookup = ctx.url.searchParams.get("lookup") === "true"

    if (id === "" && username === "") {
      return new Response(JSON.stringify({ error: "No ID or username specified" }), { status: STATUS_CODE.BadRequest })
    }

    let accountId = id
    const currentData = ctx.state.data as StateData
    const activeServer = currentData?.activeServer
    const signedIn = currentData.signedIn

    if (activeServer && signedIn) {
      const oauthToken = getToken(req)

      // lookup account first
      if (lookup) {
        if (username === "") {
          username = getAPBridgeUsername(id, false)
        }
        const accountResult = await searchAndVerifyAccount(oauthToken, activeServer, `@${username}`, username, true)
        if (accountResult.success && accountResult.account) {
          accountId = accountResult.account.id
        }
      }

      const followResult = await followAccount(oauthToken, activeServer, accountId)
      if (followResult.success) {
        if (followResult.relationship && followResult.relationship.requested) {
          // log to
          console.log("Attempt to follow and could only request from", activeServer, "accountId", accountId, "username", username)
        }
        return new Response(JSON.stringify(followResult.relationship), { status: STATUS_CODE.OK })
      }
      const errorMessage = JSON.stringify(followResult.error) || JSON.stringify({ error: "Unable to process request" })
      return new Response(errorMessage, { status: followResult.status })
    }

    return new Response("Unauthorized", { status: STATUS_CODE.Unauthorized })
  }
}
