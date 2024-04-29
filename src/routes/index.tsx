import { FreshContext } from "$fresh/server.ts"
import { JSX } from "preact"
import SelectServer from "../islands/SelectServer.tsx"
import { StateData } from "../types/StateData.ts"
import { getCanonical } from "../utils/utils.ts"
import { Head } from "$fresh/runtime.ts"

// deno-lint-ignore require-await
export default async function HomePage(_req: Request, ctx: FreshContext): Promise<JSX.Element> {
  const stateData = ctx.state.data as StateData
  const canonical = getCanonical("")

  return (
    <section className="flex-1 flex flex-col items-center justify-center">
      <Head>
        <link rel="canonical" href={canonical} />
        <meta property="og:url" content={canonical} />
      </Head>
      <div className="flex flex-col items-center justify-center space-y-4 text-center px-4">
        <h1 className="text-4xl tracking-tighter md:text-6xl">
          Follow Podcasts and Music feeds on the Fediverse
        </h1>
        <p className="max-w-[600px] text-2xl md:text-4xl">
          {"Using your Mastodon or Pleroma account!"}
        </p>
        <p className="max-w-[600px] text-sm">
          Optionally sign in with your account and then <a href="/upload">Upload</a> an OPML of feeds or <a
          href="/search">Search</a> for the feed to follow. View prior <a href="/feeds">feeds</a>.
        </p>
        <div className="space-x-4">
          <SelectServer header={false} stateData={stateData} />
        </div>
        <p className="max-w-[600px] text-sm">
          Don't have a Mastodon or Pleroma account, the feeds can still be followed by copying the feed user to the
          search box on your server.
        </p>
      </div>
    </section>
  )
}
