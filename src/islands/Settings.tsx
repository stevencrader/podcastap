import { Signal, useSignal } from "@preact/signals"
import { JSX } from "preact"
import { Button } from "../components/Button.tsx"
import { Account } from "../types/MastodonAPI.ts"
import { PIResponseFeed } from "../types/podcastindex.ts"
import { deleteFeeds, deleteServerUrls, getFeeds, getLocalServerUrls } from "../utils/localStorageManager.ts"
import DarkModeControl from "./DarkModeControl.tsx"
import OPMLWriter from "./OPMLWriter.tsx"

interface SettingsProps {
  activeServer?: string
  user?: Account
}

export default function Settings(props: SettingsProps): JSX.Element {
  const { activeServer, user } = props
  const feeds: Signal<PIResponseFeed[]> = useSignal(getFeeds())
  const localServerUrls: Signal<string[]> = useSignal(getLocalServerUrls())
  return (
    <>
      <div className="flex flex-row gap-2 items-center p-2">
        <p>Clear the feeds stored in the local storage</p>
        <Button
          disabled={feeds.value.length === 0}
          onClick={() => {
            const doDelete = deleteFeeds(true)
            if (doDelete) {
              deleteFeeds(false, true)
              feeds.value = getFeeds()
            }
          }}
        >
          Clear Feeds
        </Button>
      </div>

      <div className="flex flex-row gap-2 items-center p-2">
        <p>Clear the server URLS stored in the local storage</p>
        <Button
          disabled={localServerUrls.value.length === 0}
          onClick={() => {
            const doDelete = deleteServerUrls()
            if (doDelete) {
              localServerUrls.value = getLocalServerUrls()
            }
          }}
        >
          Clear Server URLs
        </Button>
      </div>

      <div className="flex flex-row gap-2 items-center p-2">
        <p>Set color scheme</p>
        <DarkModeControl selector={true} />
      </div>

      <div className="flex flex-row gap-2 items-center p-2">
        <p>Download all feed data as an OPML file</p>
        <Button
          disabled={feeds.value.length === 0}
          onClick={() => {
            OPMLWriter(feeds.value, activeServer, user)
          }}
        >
          Download Feeds
        </Button>
      </div>
    </>
  )
}
