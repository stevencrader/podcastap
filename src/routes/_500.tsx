import { Head } from "$fresh/runtime.ts"
import { PageProps } from "$fresh/server.ts"
import { JSX } from "preact"
import { getTitle } from "../utils/utils.ts"

export default function Error500Page(props: PageProps): JSX.Element {
  const { error } = props
  const title = "500 - Internal Server Error"
  const pageTitle = getTitle(title)
  const description = `${error ? (error as Error).message : "Error occurred"}`

  return (
    <section className="p-2 space-y-2 md:p-4 md:space-y-4">
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={description} />
        <meta property="og:description" content={description} />
        <meta property="og:title" content={pageTitle} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={description} />
      </Head>
      <h1>{title}</h1>
      <p>There was an error.</p>
      <p>{(error as Error).message}</p>
      <a href="/">
        Go to Home
      </a>
    </section>
  )
}
