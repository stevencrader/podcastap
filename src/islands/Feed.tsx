import { Signal, useSignal } from "@preact/signals"
import { JSX } from "preact"
import { useEffect, useState } from "preact/hooks"
import { Button } from "../components/Button.tsx"
import { Relationship } from "../types/MastodonAPI.ts"
import { LookupResult } from "../utils/ap_lookup.ts"
import FollowUnfollow from "./FollowUnfollow.tsx"
import FediverseIcon from "./icons/FediverseIcon.tsx"
import LinkIcon from "./icons/LinkIcon.tsx"
import PodcastIndexIcon from "./icons/PodcastIndexIcon.tsx"
import RSSIcon from "./icons/RSSIcon.tsx"

interface FeedProps {
  lookupResult: LookupResult
  authenticated: boolean
  activeServer?: string
}

function isImageValid(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = document.createElement("img")
    img.onerror = () => resolve(false)
    img.onload = () => resolve(true)
    img.src = src
  })
}

function FeedImage(props: {
  imageUrl: string
  title: string
}): JSX.Element {
  return (
    <img
      src={props.imageUrl}
      alt={`Artwork for ${props.title}`}
      loading="lazy"
      className="w-full min-w-24 md:min-w-48"
    />
  )
}

export default function Feed(props: FeedProps): JSX.Element {
  const { lookupResult, activeServer, authenticated } = props
  const copyMessage = useSignal("")
  const relationshipSignal: Signal<Relationship | undefined> = useSignal(lookupResult?.apData?.relationship)
  const [imageUrl, setImageUrl] = useState<string>("/noimage.jpg")

  useEffect(() => {
    if (lookupResult.feed.image) {
      isImageValid(lookupResult.feed.image)
        .then((value) => {
          if (value && lookupResult.feed.image) {
            setImageUrl(lookupResult.feed.image)
          } else if (lookupResult.feed.artwork) {
            isImageValid(lookupResult.feed.artwork)
              .then((value2) => {
                if (value2 && lookupResult.feed.artwork) {
                  setImageUrl(lookupResult.feed.artwork)
                }
              })
          }
        })
    }
  }, [])

  async function copyAPUser() {
    const apUser = `@${lookupResult.feed.id}@ap.podcastindex.org`
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
    <div className="border border-zinc-800 flex flex-col md:flex-row p-2 gap-2">
      <div class="w-24 md:w-48 self-center grow-0">
        {lookupResult.feed.link === ""
          ? <FeedImage imageUrl={imageUrl} title={lookupResult.feed.title} />
          : (
            <a href={lookupResult.feed.link} target="_blank" rel="nofollow">
              <FeedImage imageUrl={imageUrl} title={lookupResult.feed.title} />
            </a>
          )}
      </div>

      <div class="grow flex flex-col overflow-hidden text-ellipsis">
        <h3>
          {lookupResult.feed.link === "" ? lookupResult.feed.title : (
            <a
              href={lookupResult.feed.link}
              target="_blank"
              rel="nofollow"
              className="text-zinc-800 dark:text-zinc-100"
            >
              {lookupResult.feed.title}
            </a>
          )}
        </h3>

        {(lookupResult.feed.author || "") !== ""
          ? (
            <p>
              <span className="font-bold">{"By: "}</span>
              {lookupResult.feed.author}
            </p>
          )
          : <></>}

        <ul class="flex flex-row gap-2">
          {/* icons */}
          <li>
            <a href={lookupResult.feed.url} target="_blank" rel="nofollow" title="Feed URL">
              <RSSIcon />
            </a>
          </li>

          {lookupResult.feed.id
            ? (
              <li>
                <a
                  href={`https://podcastindex.org/podcast/${lookupResult.feed.id}`}
                  target="_blank"
                  rel="nofollow"
                  title="Podcast Index ID"
                >
                  <PodcastIndexIcon />
                </a>
              </li>
            )
            : <></>}

          {activeServer && (lookupResult.apData || relationshipSignal.value !== undefined)
            ? (
              <li>
                <a
                  href={`${activeServer}@${lookupResult.feed.id}@ap.podcastindex.org`}
                  target="_blank"
                  rel="nofollow"
                  title={`@${lookupResult.feed.id}@ap.podcastindex.org`}
                >
                  <FediverseIcon />
                </a>
              </li>
            )
            : <></>}

          {lookupResult.feed.id && lookupResult.feed.title
            ? (
              <li>
                <a
                  href={`/feed/${lookupResult.feed.id}?no_redirect=true`}
                  title={`${lookupResult.feed.title} on PodcastAP`}
                >
                  <LinkIcon />
                </a>
              </li>
            )
            : <></>}
        </ul>

        {
          lookupResult.feed.description ?
            <p className="mt-1 text-ellipsis overflow-hidden">{lookupResult.feed.description.replaceAll(" ", " ")}</p>
            : <></>
        }

        <ul className="flex flex-row gap-2 mt-auto pt-1 items-center ">
          {/* buttons */}
          {
            lookupResult.feed?.id
              ? (
                <div class="flex gap-2 items-center ">
                  <Button
                    title="Copy AP User to clipboard"
                    onClick={copyAPUser}
                    disabled={copyMessage.value !== ""}
                  >
                    <span className={copyMessage.value === "" ? "" : "hidden"}>Copy AP User</span>
                    <span className={copyMessage.value === "" ? "hidden" : ""}>{copyMessage.value}</span>
                  </Button>
                </div>
              )
              : <></>
          }

          {
            activeServer && authenticated ?
              <FollowUnfollow
                feedId={lookupResult?.feed?.id?.toString() || ""}
                accountId={lookupResult.apData?.account?.id || relationshipSignal.value?.id}
                relationship={relationshipSignal.value}
                onRelationshipChange={(relationship) => {
                  relationshipSignal.value = relationship
                }}
              />
              :
              <></>
          }
        </ul>
      </div>
    </div>
  )
}
