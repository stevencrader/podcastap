import { Head } from "$fresh/runtime.ts"
import { FreshContext } from "$fresh/server.ts"
import { JSX } from "preact"
import Settings from "../islands/Settings.tsx"
import { StateData } from "../types/StateData.ts"
import { getCanonical, getTitle } from "../utils/utils.ts"

// deno-lint-ignore require-await
export default async function SettingsPage(req: Request, ctx: FreshContext): Promise<JSX.Element> {
  const { user, activeServer } = ctx.state.data as StateData
  const title = "Settings"
  const canonical = getCanonical("settings")
  const pageTitle = getTitle(title)
  const description = "Configure user settings for PodcastAP"
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
      <Settings activeServer={activeServer} user={user} />
    </section>
  )
}
