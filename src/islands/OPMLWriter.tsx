import { Account } from "../types/MastodonAPI.ts"
import { PIResponseFeed } from "../types/podcastindex.ts"

function escape(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&pos;")
}

function getOutline(feed: PIResponseFeed): string {
  let outline = `  <outline type="rss" text="${escape(feed.title)}" xmlUrl="${escape(feed.url)}"`

  if (feed.podcastGuid) {
    outline = `${outline} podcast:feedGuid="${escape(feed.podcastGuid)}"`
  }
  outline = `${outline} />`
  return outline
}

export default function OPMLWriter(
  feeds: PIResponseFeed[],
  activeServer?: string,
  user?: Account
) {
  let title = "PodcastAP Feeds"
  let owner = ""
  if (activeServer && user) {
    owner = `${user.acct} on ${activeServer}`
    title = `${title} for ${owner}`
  }

  const date = new Date()
  const finalData = `<?xml version='1.0' encoding='UTF-8' standalone='yes' ?>
<opml version="2.0" xmlns:podcast="https://github.com/Podcastindex-org/podcast-namespace/blob/main/docs/1.0.md">
  <head>
    <title>${title}</title>
    <dateCreated>${date.toISOString()}</dateCreated>
    <dateModified>${date.toISOString()}</dateModified>
    <ownerName>${owner}</ownerName>
  </head>
  <body>
    <outline text="feeds">
    ${feeds.map((feed) => getOutline(feed)).join("\n    ").trimEnd()}
    </outline>
  </body>
</opml>`

  const a = document.createElement("a")
  a.href = "data:application/octet-stream," + encodeURIComponent(finalData)
  a.download = "podcastap_feeds.opml"
  a.click()
}
