import { STATUS_CODE } from "$fresh/server.ts"
import { getRelationship, searchAndVerifyAccount } from "../plugins/mastodon_api.ts"
import {
  buildResultSuccess,
  getFeedFromGUID,
  getFeedFromID,
  getFeedFromURL,
  searchByTitle
} from "../plugins/podcastindex_api.ts"
import { Account, Relationship } from "../types/MastodonAPI.ts"
import { PIResponseFeed, RequestResult } from "../types/podcastindex.ts"
import { getAPBridgeUsername, getNativeUsername } from "./ap_user.ts"

interface APData {
  account: Account
  relationship: Relationship
}

export interface LookupResult {
  feed: PIResponseFeed
  apData?: APData
  nativeApData?: APData
}

async function lookupFeed(feed: PIResponseFeed): Promise<RequestResult> {
  const { title, url, podcastGuid, id, fromIndex, native } = feed
  let requestResult: RequestResult = {
    success: false,
    statusCode: STATUS_CODE.InternalServerError,
    errorMessage: "No field for lookup"
  }

  // if data already known, skip lookup unless native flag not set
  if (id && title && url && fromIndex && native !== undefined) {
    // console.log("returning with known data", title, id, feed.source, requestResult.feed?.id, requestResult.feed?.title)
    return buildResultSuccess(feed)
  }

  // Try ID
  if (id) {
    requestResult = await getFeedFromID(id, feed)
    if (requestResult.success) {
      // console.log("returning with valid feed ID", title, id, feed.source, requestResult.feed?.id, requestResult.feed?.title)
      return requestResult
    }
  }

  // If still here, try GUID
  if (podcastGuid) {
    requestResult = await getFeedFromGUID(podcastGuid, feed)
    if (requestResult.success) {
      // console.log("returning with valid feed GUID", title, podcastGuid, feed.source, requestResult.feed?.id, requestResult.feed?.title)
      return requestResult
    }
  }

  // If still here, try using Feed URL
  if (url) {
    requestResult = await getFeedFromURL(url, feed)
    if (requestResult.success) {
      // console.log("returning with valid feed URL", title, url, feed.source, requestResult.feed?.id, requestResult.feed?.title, requestResult.feed?.url, requestResult.feed?.originalUrl)
      return requestResult
    }
  }

  // If still here, try title search
  if (title) {
    requestResult = await searchByTitle(title, feed)
    if (requestResult.success) {
      // console.log("returning with valid feed title", title, feed.source, requestResult.feed?.id, requestResult.feed?.title)
      return requestResult
    }
  }

  // unable to find match
  // console.log("unable to find match", title, feed)
  return requestResult
}

async function getApData(
  feed: PIResponseFeed,
  native: boolean,
  oauthToken: string,
  activeServer: string,
  ids: string[],
  resolve = false
): Promise<APData | undefined> {
  let username
  if (native) {
    if (!(feed.native && feed.link)) {
      return
    }
    username = getNativeUsername(feed.link, false)
  } else {
    username = getAPBridgeUsername(feed.id, false)
  }

  const accountResult = await searchAndVerifyAccount(oauthToken, activeServer, `@${username}`, username, resolve)
  if (accountResult.success && accountResult.account) {
    if (!ids.includes(accountResult.account.id)) {
      ids.push(accountResult.account.id)
      return {
        account: accountResult.account,
        relationship: {
          id: accountResult.account.id,
          following: false,
          blocked_by: false,
          blocking: false,
          domain_blocking: false,
          muting: false,
          requested: false
        }
      }
    }
  }

}

export async function lookup(
  feeds: PIResponseFeed[],
  signedIn: boolean,
  activeServer?: string,
  oauthToken?: string,
  resolve = false
): Promise<LookupResult[]> {
  const ids: string[] = []
  const lookupResults: LookupResult[] = await Promise.all(feeds.map(async (feed) => {
    // console.log("Processing feed", feed)
    let feedResult: PIResponseFeed = feed
    const result = await lookupFeed(feed)
    if (result.success && result.feed) {
      feedResult = result.feed
    }

    const lookupResult: LookupResult = {
      feed: feedResult
    }

    // mastodon lookup
    if (signedIn && activeServer && oauthToken && lookupResult.feed.id) {
      lookupResult.apData = await getApData(lookupResult.feed, false, oauthToken, activeServer, ids, resolve)
      lookupResult.nativeApData = await getApData(lookupResult.feed, true, oauthToken, activeServer, ids, resolve)
    }

    return lookupResult
  }))

  // remove duplicates now that IDs are known
  const lookupResultsUnique: LookupResult[] = lookupResults.filter((value, index, self) =>
    index === self.findIndex((t) => t.feed.id === value.feed.id)
  )

  // batch get relationships
  if (signedIn && activeServer && oauthToken && ids.length > 0) {
    const relationshipResults = await getRelationship(oauthToken, activeServer, ids)
    if (relationshipResults.success && relationshipResults.results) {
      const relationships = relationshipResults.results
      relationships.forEach((relationship) => {

        const matchingLookupResult = lookupResultsUnique.find((lookupResult) => {
          if (lookupResult.apData) {
            return lookupResult.apData.account.id === relationship.id
          }
          return false
        })

        if (matchingLookupResult) {
          if (matchingLookupResult.apData) {
            matchingLookupResult.apData.relationship = relationship
          }
        }


        const nativeMatchingLookupResult = lookupResultsUnique.find((lookupResult) => {
          if (lookupResult.nativeApData) {
            return lookupResult.nativeApData.account.id === relationship.id
          }
          return false
        })

        if (nativeMatchingLookupResult) {
          if (nativeMatchingLookupResult.nativeApData) {
            nativeMatchingLookupResult.nativeApData.relationship = relationship
          }
        }


      })
    }
  }
  return lookupResultsUnique
}
