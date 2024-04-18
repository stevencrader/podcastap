import { FreshContext, Handlers, STATUS_CODE } from "$fresh/server.ts"
import { getFollowing, getToken } from "../../plugins/mastodon_api.ts"
import { Account } from "../../types/MastodonAPI.ts"
import { PIResponseFeed } from "../../types/podcastindex.ts"
import { StateData } from "../../types/StateData.ts"
import { lookup } from "../../utils/ap_lookup.ts"
import { mergeFeeds } from "../../utils/localStorageManager.ts"

async function getCurrentFollow(
  oauthToken: string,
  activeServer: string,
  user: Account
): Promise<PIResponseFeed[]> {
  const followingResult = await getFollowing(oauthToken, activeServer, user)
  const followingFeeds: PIResponseFeed[] = []
  if (followingResult.success && followingResult.following) {
    followingResult.following.forEach((account) => {
      const index = account.acct.indexOf("@")
      // TODO would like to check if account is on Castopod or PeerTube but no identifier in Account

      if (index >= 0) {
        const id = account.acct.substring(0, index)
        let guid: string | undefined
        let url: string | undefined
        if (account.fields) {
          account.fields.forEach((field) => {
            if (field.name === "Podcast Guid") {
              guid = field.value
            } else if (field.name === "RSS") {
              const t = /href="(.+?)"/.exec(field.value)
              if (t && t.length > 0) {
                url = t[1]
              }
            }
          })
        }

        // if URL could not be found, don't add
        if (url) {
          followingFeeds.push({
            id: Number(id),
            title: account.display_name,
            url,
            originalUrl: url,
            podcastGuid: guid,
            fromIndex: false,
            source: "account",
            native: false
          })
        }
      }
    })
  }
  return followingFeeds
}

// noinspection JSUnusedGlobalSymbols
export const handler: Handlers = {
  async POST(req: Request, ctx: FreshContext): Promise<Response> {
    const { signedIn, activeServer, user } = ctx.state.data as StateData
    const oauthToken = getToken(req)

    const contentType = req.headers.get("content-type") || ""
    if (contentType.toLowerCase() !== "application/json") {
      return new Response(null, { status: STATUS_CODE.UnsupportedMediaType })
    }

    let data: {
      feeds: PIResponseFeed[]
      tempFeeds: PIResponseFeed[]
    }
    try {
      data = await req.json()
    } catch {
      return new Response(null, { status: STATUS_CODE.UnprocessableEntity })
    }

    let feeds: PIResponseFeed[] = []
    if (oauthToken && activeServer && user) {
      feeds = await getCurrentFollow(oauthToken, activeServer, user)
    }

    feeds = mergeFeeds(feeds, data.feeds)
    feeds = mergeFeeds(feeds, data.tempFeeds)

    const lookupResults = await lookup(feeds, signedIn, activeServer, oauthToken)

    return new Response(
      JSON.stringify(lookupResults),
      {
        status: STATUS_CODE.OK,
        headers: {
          "Content-Type": "application/json"
        }
      }
    )
  }
}
