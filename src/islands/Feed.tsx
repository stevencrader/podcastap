import { Signal, useSignal } from "@preact/signals"
import { JSX } from "preact"
import { useEffect, useState } from "preact/hooks"
import { Relationship } from "../types/MastodonAPI.ts"
import { LookupResult } from "../utils/ap_lookup.ts"
import { getAPBridgeUserLink, getAPBridgeUsername, getNativeUserLink, getNativeUsername } from "../utils/ap_user.ts"
import CopyUserButton from "./CopyUserButton.tsx"
import FollowUnfollow from "./FollowUnfollow.tsx"
import FediverseIcon from "./icons/FediverseIcon.tsx"
import LinkIcon from "./icons/LinkIcon.tsx"
import PodcastIndexIcon from "./icons/PodcastIndexIcon.tsx"
import RSSIcon from "./icons/RSSIcon.tsx"
import EpisodesFMIcon from "./icons/EpisodesFMIcon.tsx"

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
  const relationshipSignal: Signal<Relationship | undefined> = useSignal(lookupResult?.apData?.relationship)
  const relationshipNativeSignal: Signal<Relationship | undefined> = useSignal(lookupResult?.nativeApData?.relationship)
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

          {
            lookupResult.feed.itunesId && lookupResult.feed.itunesId !== ""
            ? (
              <li>
                <a
                  href={`https://episodes.fm/${lookupResult.feed.itunesId}`}
                  target="_blank"
                  rel="nofollow"
                  title="Follow in your Podcast App"
                >
                  <EpisodesFMIcon />
                </a>
              </li>
            )
            : <></>}

          {
            activeServer && lookupResult.feed.native && lookupResult.feed.link && (lookupResult.nativeApData || relationshipNativeSignal.value !== undefined) ?
              <li>
                <a
                  href={getNativeUserLink(activeServer, lookupResult.feed.link)}
                  target="_blank"
                  rel="nofollow"
                  title={getNativeUsername(lookupResult.feed.link)}
                >
                  <FediverseIcon />
                </a>
              </li>
              :
              activeServer && (lookupResult.apData || relationshipSignal.value !== undefined)
                ?
                (
                  <li>
                    <a
                      href={getAPBridgeUserLink(activeServer, lookupResult.feed.id)}
                      target="_blank"
                      rel="nofollow"
                      title={getAPBridgeUsername(lookupResult.feed.id)}
                    >
                      <FediverseIcon />
                    </a>
                  </li>
                )
                : <></>
          }
        </ul>

        {
          lookupResult.feed.description ?
            <p className="mt-1 text-ellipsis overflow-hidden">{lookupResult.feed.description.replaceAll(" ", " ")}</p>
            : <></>
        }

        {
          lookupResult?.feed?.id && lookupResult.feed.native && lookupResult.feed.link ?
            <ul className="flex flex-row gap-2 mt-auto pt-1 md:items-center ">
              {/* buttons */}
              <CopyUserButton lookupResult={lookupResult} />
              {
                activeServer && authenticated ?
                  <FollowUnfollow
                    feedId={lookupResult?.feed?.id?.toString() || ""}
                    username={getNativeUsername(lookupResult.feed.link, false)}
                    accountId={lookupResult.nativeApData?.account?.id || relationshipNativeSignal.value?.id}
                    relationship={relationshipNativeSignal.value}
                    onRelationshipChange={(relationship) => {
                      relationshipNativeSignal.value = relationship
                    }}
                  />
                  :
                  <></>
              }
            </ul>
            :
            <ul className={`flex flex-row gap-2 mt-auto pt-1 md:items-center `}>
              {/* buttons */}
              <CopyUserButton lookupResult={lookupResult} />
              {
                activeServer && authenticated ?
                  <FollowUnfollow
                    feedId={lookupResult?.feed?.id?.toString() || ""}
                    accountId={lookupResult.apData?.account?.id || relationshipSignal.value?.id}
                    relationship={relationshipSignal.value}
                    suffix={
                      lookupResult?.feed?.id && lookupResult.feed.native && lookupResult.feed.link ?
                        "Bridge User" : ""
                    }
                    onRelationshipChange={(relationship) => {
                      relationshipSignal.value = relationship
                    }}
                  />
                  :
                  <></>
              }
            </ul>
        }
      </div>
    </div>
  )
}
