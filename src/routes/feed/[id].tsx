import { Head } from "$fresh/runtime.ts"
import { FreshContext, Handlers } from "$fresh/server.ts"
import { STATUS_CODE } from "@std/http"
import { getCookies } from "@std/http/cookie"
import { JSX } from "preact"
import Feed from "../../islands/Feed.tsx"
import RedirectManager, { TOKEN_REDIRECT_FEED } from "../../islands/RedirectManager.tsx"
import { getToken } from "../../plugins/mastodon_api.ts"
import { getFeedFromID } from "../../plugins/podcastindex_api.ts"
import { StateData } from "../../types/StateData.ts"
import { lookup, LookupResult } from "../../utils/ap_lookup.ts"
import { getAPBridgeUsername } from "../../utils/ap_user.ts"
import { getCanonical, getTitle } from "../../utils/utils.ts"

export function getRedirect(req: Request): boolean {
  const cookies = getCookies(req.headers)
  return cookies[TOKEN_REDIRECT_FEED] === "true"
}

interface FeedPageParams {
  id: string
}

// noinspection JSUnusedGlobalSymbols
export const handler: Handlers = {
  async GET(req: Request, ctx: FreshContext): Promise<Response> {
    const { signedIn, activeServer } = ctx.state.data as StateData
    const { id } = (ctx.params as unknown) as FeedPageParams
    const resolve = ctx.url.searchParams.get("resolve") === "true"
    const oauthToken = getToken(req)
    const doRedirect = getRedirect(req)

    if (id) {
      const result = await getFeedFromID(id)

      if (result.success && result.feed) {
        const lookupResults = await lookup([result.feed], signedIn, activeServer, oauthToken, doRedirect || resolve)

        if (resolve && lookupResults.length > 0) {
          let redirectURL: URL
          if (lookupResults[0].feed.native && lookupResults[0].feed.link) {
            redirectURL = new URL(lookupResults[0].feed.link)
          } else {
            redirectURL = new URL(getAPBridgeUsername(lookupResults[0].feed.id), activeServer)
          }
          return new Response(null, {
            headers: {
              location: redirectURL.toString()
            },
            status: STATUS_CODE.TemporaryRedirect
          })
        }

        ctx.state.data = {
          ...(ctx.state.data as StateData),
          searchResults: lookupResults
        } as StateData
      } else {
        return ctx.renderNotFound({
          message: `ID ${id} is not valid`
        })
      }
    }

    return ctx.render()
  }
}

// deno-lint-ignore require-await
export default async function FeedPage(req: Request, ctx: FreshContext): Promise<JSX.Element> {
  const stateData = ctx.state.data as StateData
  const { signedIn, searchResults, activeServer } = stateData
  const doRedirect = getRedirect(req)
  const disableRedirect = ctx.url.searchParams.get("no_redirect") === "true"

  let title = "Feed"
  let canonical = ""
  let description = ""
  let image = ""
  let result: LookupResult | undefined
  if (searchResults && searchResults.length > 0) {
    result = searchResults[0]
    title = result.feed.title
    canonical = getCanonical(`feed/${result.feed.id}`)
    description = result.feed.description || `${result.feed.title} feed info`
    image = result.feed.image || result.feed.artwork || "/noimage.jpg"
  }
  const pageTitle = getTitle(title)

  return (
    <section className="p-2 space-y-2 md:p-4 md:space-y-4">
      <Head>
        <title>{pageTitle}</title>
        <meta property="og:title" content={pageTitle} />
        <meta name="twitter:title" content={pageTitle} />
        {
          result ?
            <>
              <meta name="description" content={description} />
              <meta property="og:description" content={description} />
              <link rel="canonical" href={canonical} />
              <meta property="og:url" content={canonical} />
              <meta property="og:image" content={image} />
              <meta name="twitter:description" content={description} />
              <meta name="twitter:image" content={image} />
            </>
            :
            <></>
        }

      </Head>
      <h1>{title}</h1>
      {searchResults && searchResults.length > 0
        ? (
          <div class="flex flex-col gap-4">
            <Feed
              authenticated={signedIn}
              lookupResult={searchResults[0]}
              activeServer={activeServer}
            />
            <div className="mx-auto mt-auto grow">
              {signedIn && activeServer
                ? disableRedirect
                  ? <></>
                  : <RedirectManager server={activeServer} redirect={doRedirect} feed={searchResults[0].feed} />
                : <p className="text-center">Sign in to follow or view on server</p>}
            </div>
          </div>
        )
        : <></>}
    </section>
  )
}
