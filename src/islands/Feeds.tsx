import { IS_BROWSER } from "$fresh/runtime.ts"
import { Signal, useSignal } from "@preact/signals"
import { JSX } from "preact"
import { useEffect, useState } from "preact/hooks"
import { PIResponseFeed } from "../types/podcastindex.ts"
import { LookupResult } from "../utils/ap_lookup.ts"
import { deleteFeeds, getFeeds, updateFeeds } from "../utils/localStorageManager.ts"
import Feed from "./Feed.tsx"
import Loading from "./Loading.tsx"

interface FeedsProps {
  authenticated: boolean
  activeServer?: string
}

export default function Feeds(props: FeedsProps): JSX.Element {
  const { authenticated, activeServer } = props
  if (!IS_BROWSER) {
    return <></>
  }

  const loading: Signal<boolean> = useSignal(true)
  const [lookupResults, setLookupResults] = useState<LookupResult[]>(
    getFeeds().map<LookupResult>((feed) => {
      return {
        feed
      }
    })
  )

  useEffect(() => {
    const feeds: PIResponseFeed[] = lookupResults.map<PIResponseFeed>((lookupResult: LookupResult) => lookupResult.feed)
    const tempFeeds = getFeeds(true)
    fetch(
      "/api/lookup",
      {
        method: "post",
        body: JSON.stringify({
          feeds,
          tempFeeds
        }),
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        }
      }
    )
      .then(async (response) => {
        if (response.ok) {
          const lookupResults: LookupResult[] = await response.json()
          lookupResults.sort((a, b) => a.feed.title.localeCompare(b.feed.title))
          setLookupResults(lookupResults)
          // update local storage with podcast index data
          updateFeeds(lookupResults.map((lookupResult) => lookupResult.feed))
          deleteFeeds(false, true)
          loading.value = false
        }
      })
      .finally(() => {
        loading.value = false
      })
    return
  }, [])

  return (
    <div>
      {loading.value ? <Loading size="large" /> : lookupResults.length === 0
        ? (
          <p>
            {"No feeds in storage. "}
            <a href="/upload">
              Upload an OPML
            </a>
          </p>
        )
        : (
          <div class="flex flex-col gap-2">
            {lookupResults.map((lookupResult) => {
              return <Feed lookupResult={lookupResult} authenticated={authenticated} activeServer={activeServer} />
            })}
          </div>
        )}
    </div>
  )
}
