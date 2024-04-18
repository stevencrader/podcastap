import { useSignal } from "@preact/signals"
import { JSX } from "preact"
import { Button } from "../components/Button.tsx"
import { LookupResult } from "../utils/ap_lookup.ts"
import { getAPBridgeUsername, getNativeUsername } from "../utils/ap_user.ts"

interface CopyUserButtonProps {
  lookupResult: LookupResult
  native: boolean
}

export default function CopyUserButton(props: CopyUserButtonProps): JSX.Element {
  const { lookupResult, native } = props
  const copyMessage = useSignal("")

  if (native) {
    if (!(lookupResult.feed.native && lookupResult.feed.link)) {
      return <></>
    }
  } else if (!lookupResult.feed.id) {
    return <></>
  }

  const title = native ?
    "Copy Native AP User to clipboard" :
    lookupResult.feed.native ?
      "Copy Bridge AP User to clipboard" :
      "Copy AP User to clipboard"

  const text = native ?
    "Copy AP User" :
    lookupResult.feed.native ?
      "Copy Bridge AP User" :
      "Copy AP User"

  async function copyAPUser() {
    let apUser
    if (native && lookupResult.feed.native && lookupResult.feed.link) {
      apUser = getNativeUsername(lookupResult.feed.link)
    } else {
      apUser = getAPBridgeUsername(lookupResult.feed.id)
    }
    let message: string
    let permission = { state: "granted" }

    try {
      permission = await navigator.permissions.query({
        // deno-lint-ignore ban-ts-comment
        // @ts-ignore
        name: "clipboard-write"
      })
    } catch {
      // ignore
    }

    if (permission.state === "granted" || permission.state === "prompt") {
      message = await navigator.clipboard.writeText(apUser)
        .then(() => {
          return "Text copied"
        })
        .catch(() => {
          return "Unable to copy text"
        })
    } else {
      message = "Unable to change clipboard"
    }

    if (message) {
      copyMessage.value = message
      setTimeout(() => {
        copyMessage.value = ""
      }, 1500)
    }
  }


  return (
    <div className="flex flex-row gap-2 items-center">
      <Button
        title={title}
        onClick={copyAPUser}
        disabled={copyMessage.value !== ""}
      >
        <span className={copyMessage.value === "" ? "" : "hidden"}>{text}</span>
        <span className={copyMessage.value === "" ? "hidden" : ""}>{copyMessage.value}</span>
      </Button>
    </div>
  )
}
