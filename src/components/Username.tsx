import { JSX } from "preact"
import { Account } from "../types/MastodonAPI.ts"
import parseEmoji from "../utils/parseEmoji.tsx"

interface UsernameProps extends JSX.HTMLAttributes<HTMLButtonElement> {
  user?: Account
  activeServer?: string
  showAccount?: boolean
}

export function Username(props: UsernameProps) {
  const { user, activeServer, showAccount } = props

  if (user === undefined) {
    return <></>
  }

  const { display_name, acct, emojis } = user
  let serverBase = ""
  let userLink
  if (activeServer) {
    const url = new URL(`@${acct}`, activeServer)
    userLink = url.toString()
    serverBase = url.host
  } else {
    userLink = user.url
  }

  const nameParts = parseEmoji(display_name, emojis)

  return (
    <div class="inline-flex gap-2">
      <a
        href={userLink}
        target="_blank"
        class="flex flex-row gap-2 px-1 hover:underline underline-offset-4 text-slate-900 dark:text-slate-50"
        title={`@${acct}@${serverBase}`}
      >
        {nameParts ? nameParts.map((part) => part) : <span>{display_name}</span>}
      </a>
      {showAccount ? <span title={`@${acct}@${serverBase}`}>{`@${acct}`}</span> : <></>}
    </div>
  )
}
