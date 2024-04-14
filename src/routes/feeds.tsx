import { Head } from "$fresh/runtime.ts"
import { PageProps } from "$fresh/server.ts"
import { JSX } from "preact"
import Feeds from "../islands/Feeds.tsx"
import { StateData } from "../types/StateData.ts"
import { getCanonical, getTitle } from "../utils/utils.ts"

export default function FeedsPage(props: PageProps): JSX.Element {
  const { user, signedIn, activeServer } = props.state.data as StateData
  const title = "Feeds"
  const canonical = getCanonical("feeds")
  const pageTitle = getTitle(title)
  const description = "Podcast and Music feeds followed by the user or uploaded via OPML"

  return (
    <section className="p-2 space-y-2 md:p-4 md:space-y-4">
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
      <Feeds authenticated={signedIn} activeServer={activeServer} />
    </section>
  )
}
