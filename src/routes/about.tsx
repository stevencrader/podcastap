import { Head } from "$fresh/runtime.ts"
import { JSX } from "preact"
import { LinkData } from "../types/LinkData.ts"
import { getCanonical, getTitle } from "../utils/utils.ts"

const SUPPORT_LINKS: LinkData[] = [
  {
    title: "Mastodon (podcastindex.social)",
    href: "https://podcastindex.social/@steven"
  },
  {
    title: "X",
    href: "https://x.com/stevencrader"
  },
  {
    title: "Bitcoin/Lightning (Alby)",
    href: "https://getalby.com/p/stevencrader"
  },
  {
    title: "Personal Site",
    href: "https://steven.crader.co/"
  },
  {
    title: "PodcastAP Source Code",
    href: "https://github.com/stevencrader/podcastap"
  },
  {
    title: "Email",
    href: "mailto:steven@podcastap.com"
  }
]

export default function AboutPage(): JSX.Element {
  const title = "About"
  const canonical = getCanonical("about")
  const pageTitle = getTitle(title)
  const description = "PodcastAP: connecting Fediverse users to their Podcast and Music feeds"
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
      <p>
        {"PodcastAP uses the "}
        <a href="https://podcastindex.org" target="_blank">PodcastIndex.org</a>
        {" API, the "}
        <a href="https://docs.joinmastodon.org/api/" target="_blank">Mastodon API</a>
        {` and a user's subscription
        feeds imported via OPML to follow Podcast, Music and other feeds on the `}
        <a href="https://en.wikipedia.org/wiki/Fediverse" target="_blank">Fediverse</a>
        {"."}
      </p>

      <p>
        The feeds are bridged from the XML feed to the Podcast Index database to the Podcast Index Activity Pub bridge
        (<code>ap.podcastindex.org</code>).
      </p>

      <p>
        {"When a user logs in using a "}
        <a href="https://joinmastodon.org/" target="_blank">Mastodon</a>
        {" or "}
        <a href="https://pleroma.social/" target="_blank">Pleroma</a>
        {` instance, the feed can be followed
          automatically. For users using another Fediverse application, the feed user string can be copied and pasted in
          to the search for the Fediverse software.`}
      </p>

      <p>
        When logged in, feeds currently followed will be found (up to the 320 accounts) and reported on the{" "}
        <a href="/feeds">Feeds</a> page.
      </p>

      <p>
        Additionally, feeds can be found by searching for them on the <a href="/search">Search</a> page.
      </p>

      <h2>Support</h2>
      <p>
        This tool is created by Steven Crader. Follow and support using any of the following:
      </p>
      <ul class="list-disc ml-8">
        {SUPPORT_LINKS.map((item) => (
          <li>
            <a href={item.href} target="_blank">{item.title}</a>
          </li>
        ))}
      </ul>
    </section>
  )
}