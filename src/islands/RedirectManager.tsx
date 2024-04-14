import { IS_BROWSER } from "$fresh/runtime.ts"
import { JSX } from "preact"

export const TOKEN_REDIRECT_FEED = "redirect-feed"

interface RedirectManagerProps {
  redirect: boolean
  id?: string | number
  server?: string
}

export default function RedirectManager(props: RedirectManagerProps): JSX.Element {
  const { redirect, id, server } = props

  function clicked(e: MouseEvent) {
    const checkbox = e.target as HTMLInputElement
    if (checkbox.checked) {
      document.cookie = `${TOKEN_REDIRECT_FEED}=true;path=/`
    } else {
      document.cookie = `${TOKEN_REDIRECT_FEED}=true;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/`
    }
  }

  if (server === undefined || server === "") {
    return (
      <div>
        <label
          className="inline-flex gap-2 items-center p-2"
          htmlFor="redirect"
        >
          <span>Automatically redirect feed pages to account on server?</span>
          <input
            type="checkbox"
            id="redirect"
            checked={redirect}
            onClick={clicked}
          />
        </label>
      </div>
    )
  }

  if (IS_BROWSER && redirect && server) {
    const redirectURL = new URL(`@${id}@ap.podcastindex.org`, server)
    globalThis.open(redirectURL, "_blank")
  }

  return (
    <>
      {redirect
        ? (
          <>
            <p>
              {`Profile for @${id}@ap.podcastindex.org should have opened automatically. If not, open `}
              <a
                href={`${server}@${id}@ap.podcastindex.org`}
                target="_blank"
              >
                {`@${id}@ap.podcastindex.org`}
              </a>
              {` on ${server}`}
            </p>
          </>
        )
        : <></>}
      <label
        className="flex flex-row gap-2 items-center mt-6 justify-center"
        for="redirect"
      >
        <span>Automatically redirect to account on {server} next time?</span>
        <input
          type="checkbox"
          id="redirect"
          checked={redirect}
          onClick={clicked}
        />
      </label>
    </>
  )
}
