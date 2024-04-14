import { Head } from "$fresh/runtime.ts"
import { JSX } from "preact"
import FileInput from "../islands/FileInput.tsx"
import { getCanonical, getTitle } from "../utils/utils.ts"

export default function UploadPage(): JSX.Element {
  const title = "Upload"
  const canonical = getCanonical("upload")
  const pageTitle = getTitle(title)
  const description = "Upload Podcast/Music Feeds via OPML"
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
      <FileInput />
      <p className="text-center">
        <a href="/feeds">View Feeds</a>
      </p>
    </section>
  )
}
