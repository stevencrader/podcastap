import { Signal, useSignal } from "@preact/signals"
import { Button } from "../components/Button.tsx"
import { MastodonError, Relationship } from "../types/MastodonAPI.ts"
import Loading from "./Loading.tsx"

interface FollowUnfollowProps {
  feedId: string
  accountId?: string
  relationship?: Relationship
  onRelationshipChange?: (relationship: Relationship) => void
}

function getRelationshipInfo(relationship?: Relationship): {
  following: boolean
  requested: boolean
  muted: boolean
  blocked: boolean
} {
  return {
    following: relationship?.following === true,
    requested: relationship?.requested === true,
    muted: relationship?.muting === true,
    blocked: relationship?.blocked_by === true || relationship?.blocking === true ||
      relationship?.domain_blocking === true
  }
}

export default function FollowUnfollow(props: FollowUnfollowProps) {
  const { feedId, relationship, onRelationshipChange } = props
  const { following, requested, muted, blocked } = getRelationshipInfo(relationship)
  let accountId = props.accountId
  const blockedSignal: Signal<boolean> = useSignal(blocked)
  const mutedSignal: Signal<boolean> = useSignal(muted)
  const requestedSignal: Signal<boolean> = useSignal(requested)
  const followingSignal: Signal<boolean> = useSignal(following)
  const working: Signal<boolean> = useSignal(false)
  const disabled: Signal<boolean> = useSignal(blockedSignal.value || mutedSignal.value || requestedSignal.value)
  const errorMessage: Signal<string> = useSignal("")

  async function handleClick(_ev: Event) {
    working.value = true
    disabled.value = true
    errorMessage.value = ""

    const api = followingSignal.value ? "unfollow" : "follow"
    const url = new URL(`/api/mastodon/${api}`, globalThis.location.origin)
    if (accountId !== undefined) {
      url.searchParams.set("id", accountId)
    } else {
      url.searchParams.set("id", feedId)
      url.searchParams.set("lookup", "true")
    }
    const response = await fetch(url)
    const result = await response.json() as Relationship | MastodonError
    if (response.ok) {
      const { following, requested, muted, blocked } = getRelationshipInfo(result as Relationship)
      blockedSignal.value = blocked
      mutedSignal.value = muted
      requestedSignal.value = requested
      followingSignal.value = following
      if (onRelationshipChange) {
        accountId = (result as Relationship).id
        onRelationshipChange(result as Relationship)
      }
    } else {
      const error = (result as MastodonError).error
      let newErrorMessage
      if (error) {
        newErrorMessage = error
      } else {
        newErrorMessage = result.toString()
      }
      if (newErrorMessage) {
        errorMessage.value = newErrorMessage
        setTimeout(() => errorMessage.value = "", 1500)
      }
    }

    working.value = false
    disabled.value = blockedSignal.value || mutedSignal.value || requestedSignal.value
  }

  return (
    <div className="flex flex-row gap-2 items-center">
      <Button
        onClick={handleClick}
        disabled={disabled.value}
      >
        <Loading size="small" className={`${working.value ? "" : "hidden"} [&>div.segment]:bg-slate-200`} />
        <span className={working.value ? "hidden" : ""}>
          {followingSignal.value
            ? "Unfollow"
            : blockedSignal.value
              ? "Blocked"
              : mutedSignal.value
                ? "Muted"
                : requestedSignal.value
                  ? "Request Sent"
                  : "Follow"}
        </span>
      </Button>
      {errorMessage.value === "" ? <></> : <span>{errorMessage.value}</span>}
    </div>
  )
}
