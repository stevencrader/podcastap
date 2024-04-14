import { Head } from "$fresh/runtime.ts"
import { JSX } from "preact"
import { getServerUrls } from "../plugins/db.ts"
import { getCanonical, getTitle } from "../utils/utils.ts"

interface DataInfo {
  name: string
  description: string
}

const servers = await getServerUrls()
const serversListHTML = [`<ul class="list-disc ml-8">`]
servers.sort().forEach((server) =>
  serversListHTML.push(`<li><a href="${server}" target="_blank" rel="nofollow">${server}</a></li>`)
)
serversListHTML.push("</ul>")

const DATABASE_DATA: DataInfo[] = [
  {
    name: "Server URL",
    description:
      `The URL of the instance used to sign in to the site. All others are stored in the user's browser (see Local Storage). Only the following are shown by default: ${
        serversListHTML.join("")
      }`
  },
  {
    name: "Server Type",
    description: "The type of Fediverse server (ex: Mastodon)"
  },
  {
    name: "Application Credentials",
    description: "The credentials used to authenticate the PodcastAP site with the fediverse instance."
  },
  {
    name: "Date Created and Update",
    description: "Stores the first time the server was used and then the last time it was used."
  }
]

const LOCAL_STORAGE_DATA: DataInfo[] = [
  {
    name: "Feeds",
    description:
      `The information about the feeds imported via OPML, followed via search or found to already be following (when logged in). These can be removed on the <a
        href="/settings">Settings</a> page.`
  },
  {
    name: "Servers",
    description: "Names of servers other than the default used by this user to log in to the site."
  },
  {
    name: "Theme",
    description: "Remembers whether light or dark mode preferred. This can be set using the toggle in the lower right corner or on the <a href=\"/settings\">Settings</a> page."
  }
]

const COOKIES_DATA: DataInfo[] = [
  {
    name: "Active Server",
    description: "The last server used to log in on the site."
  },
  {
    name: "Auth Details",
    description: "The information used to authenticate with the Fediverse server using oAuth."
  }
]

const OAUTH_DATA: DataInfo[] = [
  {
    name: "Read Accounts",
    description: "Required to read account data."
  },
  {
    name: "Read/Write Follows",
    description: "Used to get followers and update following status when Follow/Unfollow button pressed."
  },
  {
    name: "Read Search",
    description: "Used to search for feeds on fediverse server."
  }
]

function DataList(props: { dataList: DataInfo[] }): JSX.Element {
  return (
    <>
      {
        props.dataList.map((item) => (
          <dl className="ml-4">
            <dt>{item.name}</dt>
            <dd className="ml-4" dangerouslySetInnerHTML={{ __html: item.description }}></dd>
          </dl>
        ))
      }
    </>
  )
}

export default function TermsPage(): JSX.Element {
  const title = "Legal"
  const canonical = getCanonical("legal")
  const pageTitle = getTitle(title)
  const description = ""
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
        This website stores and tracks the minimal information required for the site to work.
      </p>

      <p>
        Feed information, including links, description, and any other information, are reported using the Podcast Index
        API. If you would like your information removed, please contact your hosting provider to remove your data from
        podcast aggregators.
      </p>
      <p>
        {`If unable to work with your hosting provider, request your information removed from the `}
        <a href="https://podcastindex.org/" target="_blank" rel="nofollow">Podcast Index</a>
        {` database. Removing your information from the database will remove it from all applications using the index information.`}
      </p>
      <p>
        {`To request your information only be removed from the PodcastAP site, send an email to `}
        <a href="mailto:steven@podcastap.com" target="_blank" rel="nofollow">steven@podcastap.com</a>.
      </p>

      <h2>Stored Data</h2>

      <h3>Database</h3>
      <p>The following information is stored in the system's database:</p>
      <DataList dataList={DATABASE_DATA} />

      <h3>Local Storage</h3>
      <p>The following information is stored in the local storage in the user's browser:</p>
      <DataList dataList={LOCAL_STORAGE_DATA} />

      <h3>Cookies</h3>
      <p>The following information is stored as cookies in the user's browser:</p>
      <DataList dataList={COOKIES_DATA} />

      <h3>OAuth Permissions</h3>
      <p>The following permissions are requested when signing in with a Mastodon or Pleroma server:</p>
      <DataList dataList={OAUTH_DATA} />

      <h2>Icons</h2>
      <p>
        {"Icons from "}
        <a href="https://podcastfont.com/" target="_blank" rel="nofollow">Podcast Font</a>
        {" and "}
        <a href="https://heroicons.com/" target="_blank" rel="nofollow">Heroicons</a>.
      </p>
    </section>
  )
}
