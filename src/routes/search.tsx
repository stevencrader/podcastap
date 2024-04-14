import { Head } from "$fresh/runtime.ts"
import { FreshContext, Handlers, PageProps } from "$fresh/server.ts"
import { JSX } from "preact"
import { SearchForm } from "../components/SearchForm.tsx"
import Feed from "../islands/Feed.tsx"
import { getToken } from "../plugins/mastodon_api.ts"
import { searchByTerm, searchByTitle, searchMusicByTerm } from "../plugins/podcastindex_api.ts"
import { RequestResult } from "../types/podcastindex.ts"
import { StateData } from "../types/StateData.ts"
import { lookup } from "../utils/ap_lookup.ts"
import { getCanonical, getTitle } from "../utils/utils.ts"

type SearchType = "all" | "title" | "music"

export function getSearchType(value: string | null): SearchType {
  if (value !== null) {
    value = value.toLowerCase()
  }
  if (value !== "title" && value !== "music") {
    return "all"
  }
  return value
}

// noinspection JSUnusedGlobalSymbols
export const handler: Handlers = {
  async GET(req: Request, ctx: FreshContext): Promise<Response> {
    const searchValue = ctx.url.searchParams.get("q") || ""
    const searchType = getSearchType(ctx.url.searchParams.get("type"))

    if (searchValue) {
      let result: RequestResult
      if (searchType === "title") {
        result = await searchByTitle(searchValue, undefined, 10, true)
      } else if (searchType === "music") {
        result = await searchMusicByTerm(searchValue, undefined, 10, true)
      } else {
        result = await searchByTerm(searchValue, undefined, 10, true)
      }

      if (result.success && result.feeds) {
        // console.log("feeds", result)
        const { signedIn, activeServer } = ctx.state.data as StateData
        const oauthToken = getToken(req)

        const lookupResults = await lookup(result.feeds, signedIn, activeServer, oauthToken)

        ctx.state.data = {
          ...(ctx.state.data as StateData),
          searchResults: lookupResults
        } as StateData
      }
    }

    return ctx.render()
  }
}

export default function SearchPage(props: PageProps): JSX.Element {
  const { signedIn, activeServer, searchResults } = props.state.data as StateData
  const searchValue = props.url.searchParams.get("q") || ""
  const searchType = getSearchType(props.url.searchParams.get("type"))

  const title = "Search"
  const canonical = getCanonical(searchValue ? `search?q=${searchValue}&${searchType}` : "search")
  const pageTitle = getTitle(searchValue ? `${searchValue} | ${title}` : title)
  const description = "Search for Podcast and Music feeds to follow on the Fediverse"
  return (
    <section className="flex flex-col mx-auto w-full p-2 space-y-2 md:p-4 md:space-y-4">
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={description} />
        <meta property="og:description" content={description} />
        <meta property="og:title" content={pageTitle} />
        <link rel="canonical" href={canonical} />
        <meta property="og:url" content={canonical} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={description} />
      </Head>
      <h1>{title}</h1>
      <SearchForm searchValue={searchValue} searchType={searchType} />
      {searchResults
        ? (
          <div>
            <h2>Results</h2>
            <div class="flex flex-col gap-2">
              {searchResults.map((result) => {
                return (
                  <Feed
                    authenticated={signedIn}
                    lookupResult={result}
                    activeServer={activeServer}
                  />
                )
              })}
            </div>
          </div>
        )
        : <></>}
    </section>
  )
}
