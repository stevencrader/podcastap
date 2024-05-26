import { STATUS_CODE } from "$fresh/server.ts"
import { encodeHex } from "@std/encoding/hex"
import { PIHeaders, PIResponse, PIResponseFeed, RequestResult } from "../types/podcastindex.ts"
import { getNativeUsername } from "../utils/ap_user.ts"
import { getRequiredEnv } from "../utils/utils.ts"

const BASE_API_URL = getRequiredEnv("BASE_API_URL")
const API_KEY = getRequiredEnv("API_KEY")
const API_SECRET = getRequiredEnv("API_SECRET")
const USER_AGENT = getRequiredEnv("USER_AGENT")

/**
 * Generate the authorization value
 * @param date current time in seconds (epoch)
 * @returns authorization value
 */
async function generateAuthorization(date: number): Promise<string> {
  const auth = new Uint8Array(
    await crypto.subtle.digest(
      "SHA-1",
      new TextEncoder().encode(`${API_KEY}${API_SECRET}${date}`)
    )
  )
  return encodeHex(auth)
}

async function getPIHeaders(): Promise<PIHeaders> {
  const date = Math.round(new Date().getTime() / 1000)
  const auth = await generateAuthorization(date)
  return {
    Authorization: auth,
    "X-Auth-Date": date.toString(),
    "X-Auth-Key": `${API_KEY}`,
    "User-Agent": `${USER_AGENT}`,
    "Content-Type": "application/json"
  }
}

type RequestParams = {
  url?: string
  guid?: string
  q?: string // the title
  id?: string
  max?: string
}

function isNative(feed: PIResponseFeed, originalFeed?: PIResponseFeed): boolean {
  const native = feed?.native || originalFeed?.native
  // console.log("checking feed isNative", feed?.generator, native, feed.title)
  // if already marked native, return
  if (native) {
    return true
  }

  const generator = (feed?.generator || "").toLowerCase()
  // Are their other hosts/generators that are Fediverse first?
  // Is there another signal that could be used?
  // See https://github.com/Podcastindex-org/podcast-namespace/discussions/559

  const generatorMatch = generator.includes("castopod") || generator.includes("toraifōsu")
  if (generatorMatch && feed.link) {
    const username = getNativeUsername(feed.link)
    return username !== ""
  }
  return false
}


function buildPIResponseFeed(feed: PIResponseFeed, originalFeed?: PIResponseFeed): PIResponseFeed {
  const id = feed.id || originalFeed?.id
  const title = feed.title || originalFeed?.title
  const url = feed.url || originalFeed?.url
  const native = isNative(feed, originalFeed)
  return {
    // rebuilding feed here since the feed passed in may contain attributes not needed (from the API)
    id: id,
    title: title || "",
    url: url || "",
    originalUrl: feed.originalUrl || originalFeed?.originalUrl || "",
    link: feed.link || originalFeed?.link,
    description: feed.description || originalFeed?.description,
    author: feed.author || originalFeed?.author,
    image: feed.image || originalFeed?.image,
    artwork: feed.artwork || originalFeed?.artwork,
    generator: feed.generator || originalFeed?.generator,
    itunesId: feed.itunesId || originalFeed?.itunesId,
    podcastGuid: feed.podcastGuid || originalFeed?.podcastGuid,
    fromIndex: id !== undefined && title !== undefined && url !== undefined,
    source: originalFeed?.source || feed.source || "search",
    native: originalFeed?.native || native
  }
}

export function buildResultSuccess(
  feed: PIResponseFeed,
  originalFeed?: PIResponseFeed
): RequestResult {
  return {
    success: true,
    statusCode: STATUS_CODE.OK,
    // rebuilding feed here since the feed passed in may contain attributes not needed (from the API)
    feed: buildPIResponseFeed(feed, originalFeed)
  }
}

export function buildResultSuccessMultiple(
  feeds: PIResponseFeed[]
): RequestResult {
  return {
    success: true,
    statusCode: STATUS_CODE.OK,
    // rebuilding feed here since the feed passed in may contain attributes not needed (from the API)
    feeds: feeds.map((feed) => buildPIResponseFeed(feed))
  }
}

function getFeedFromList(
  feeds: PIResponseFeed[],
  originalFeed?: PIResponseFeed,
  multiple = false
): RequestResult {
  const feedResult: RequestResult = {
    success: false,
    statusCode: STATUS_CODE.InternalServerError,
    errorMessage: "Could not find matching feed with title"
  }

  if (multiple) {
    return buildResultSuccessMultiple(feeds)
  } else if (feeds.length > 0) {
    return buildResultSuccess(feeds[0], originalFeed)
  }
  return feedResult
}

function getOkRequestResult(
  body: PIResponse,
  originalFeed?: PIResponseFeed,
  multiple = false
): RequestResult | undefined {
  // console.log("request JSON", body)
  if (body.status === "true") {
    if (body.feeds && body.feeds.length > 0) {
      return getFeedFromList(body.feeds, originalFeed, multiple)
    }
    if (Array.isArray(body.feed) && body.feed.length > 0) {
      return getFeedFromList(body.feed, originalFeed, multiple)
    }
    if (!Array.isArray(body.feed) && body?.feed) {
      if (multiple) {
        return buildResultSuccessMultiple([body.feed])
      } else {
        return buildResultSuccess(body.feed, originalFeed)
      }
    }
  }
  return undefined
}

async function makeRequest(
  pathname: string,
  searchParams: RequestParams,
  originalFeed?: PIResponseFeed,
  multiple = false
): Promise<RequestResult> {
  // console.log("Requesting", pathname, searchParams)
  const url = new URL(`${BASE_API_URL}${pathname}`)
  Object.entries(searchParams).forEach((entry) => {
    // const value = searchParams[key as keyof RequestParams] as string
    url.searchParams.append(entry[0], entry[1])
  })
  // console.log("URL", url)

  const response = await fetch(url, {
    method: "GET",
    headers: await getPIHeaders()
  })

  let body: PIResponse | string = ""

  if (
    response.ok && response.headers.get("content-type") === "application/json"
  ) {
    body = (await response.json()) as PIResponse
    const requestResult = getOkRequestResult(body, originalFeed, multiple)
    if (requestResult) {
      return requestResult
    }

    if (body.status === "false") {
      return {
        success: false,
        statusCode: STATUS_CODE.InternalServerError,
        errorMessage: "Request returned a status of 'false'"
      }
    }
  }

  if (body === "") {
    body = await response.text()
  }

  return {
    success: false,
    statusCode: STATUS_CODE.InternalServerError,
    errorMessage: `Error getting feed data ${body}`
  }
}

export function getFeedFromID(pid: number | string, originalFeed?: PIResponseFeed): Promise<RequestResult> {
  // noinspection SpellCheckingInspection
  return makeRequest("/podcasts/byfeedid", {
    id: pid.toString()
  }, originalFeed)
}

export function getFeedFromURL(url: string, originalFeed?: PIResponseFeed): Promise<RequestResult> {
  // noinspection SpellCheckingInspection
  return makeRequest("/podcasts/byfeedurl", {
    url
  }, originalFeed)
}

export function getFeedFromGUID(guid: string, originalFeed?: PIResponseFeed): Promise<RequestResult> {
  // noinspection SpellCheckingInspection
  return makeRequest("/podcasts/byguid", {
    guid
  }, originalFeed)
}

export function searchByTitle(
  title: string,
  originalFeed?: PIResponseFeed,
  max: number = 10,
  multiple = false
): Promise<RequestResult> {
  // noinspection SpellCheckingInspection
  return makeRequest(
    "/search/bytitle",
    {
      q: title,
      max: `${max}`
    },
    originalFeed,
    multiple
  )
}

export function searchByTerm(
  term: string,
  originalFeed?: PIResponseFeed,
  max: number = 10,
  multiple = false
): Promise<RequestResult> {
  // noinspection SpellCheckingInspection
  return makeRequest(
    "/search/byterm",
    {
      q: term,
      max: `${max}`
    },
    originalFeed,
    multiple
  )
}

export function searchMusicByTerm(
  term: string,
  originalFeed?: PIResponseFeed,
  max: number = 10,
  multiple = false
): Promise<RequestResult> {
  // noinspection SpellCheckingInspection
  return makeRequest(
    "/search/music/byterm",
    {
      q: term,
      max: `${max}`
    },
    originalFeed,
    multiple
  )
}
