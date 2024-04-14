import { type PageProps } from "$fresh/server.ts"
import { JSX } from "preact"
import Footer from "../components/Footer.tsx"
import Header from "../components/Header.tsx"
import DarkModeControl from "../islands/DarkModeControl.tsx"
import LocalServerHandler from "../islands/LocalServerHandler.tsx"

import { initDB } from "../plugins/db.ts"
import { StateData } from "../types/StateData.ts"
import { getTitle } from "../utils/utils.ts"

await initDB()

export default function App(props: PageProps): JSX.Element {
  const { Component, url } = props
  const stateData = props.state.data as StateData

  const author = "Steven Crader"
  const description = "With PodcastAP, users on the Fediverse can search for and follow Podcast and Music feeds with their Mastodon or Pleroma account"

  return (
    <html className="dark">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{getTitle()}</title>
      <link rel="icon" type="image/x-icon" href="/logo_light.png" />
      <link rel="stylesheet" href="/styles.css" />

      <meta name="author" content={author} />
      <meta name="description" content={description} />

      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={getTitle()} />
      <meta name="twitter:title" content={getTitle()} />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:description" content={description} />
    </head>
    <body class="flex flex-col min-h-[100dvh] bg-gray-50 dark:bg-gray-950">
    <Header stateData={stateData} home={url.pathname === "/"} />
    <main id="content"
          className="flex-1 flex flex-col mx-auto max-w-screen-xl w-full p-2 space-y-2 md:p-4 md:space-y-4">
      <LocalServerHandler stateData={stateData} error={props?.error as Error} />
      <Component />
      {url.pathname.startsWith("/settings") ? <></> : <DarkModeControl />}
    </main>
    <Footer />
    </body>
    </html>
  )
}
