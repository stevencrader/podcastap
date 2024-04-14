import { Head } from "$fresh/runtime.ts"
import { FreshContext } from "https://deno.land/x/fresh@1.6.1/src/server/types.ts"
import { JSX } from "preact"
import { getTitle } from "../utils/utils.ts"

// deno-lint-ignore require-await
export default async function Error404Page(req_: Request, ctx: FreshContext): Promise<JSX.Element> {
  const title = "404 - Page not found"
  let message = "The page you were looking for doesn't exist."
  let customMessage = false
  if (ctx.data?.message) {
    customMessage = true
    message = ctx.data.message
  }
  const pageTitle = getTitle(customMessage ? `${message} | ${title}` : title)

  return (
    <section className="p-2 space-y-2 md:p-4 md:space-y-4">
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={message} />
        <meta property="og:description" content={message} />
        <meta property="og:title" content={pageTitle} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={message} />
      </Head>
      <h1>{title}</h1>
      <p>{message}</p>
      <a href="/">
        Go to Home
      </a>
    </section>
  )
}
