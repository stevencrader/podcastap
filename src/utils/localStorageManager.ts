import { IS_BROWSER } from "$fresh/runtime.ts"
import { PIResponseFeed } from "../types/podcastindex.ts"
import { ThemeOption } from "./theme.ts"
import { getURL } from "./url.ts"

const FEEDS = "feeds"
const SERVER_URLS = "server_urls"
const TEMP_FEEDS = "temp_feeds"
const TEMP_SERVER_URL = "temp_server_url"
const THEME = "theme"

export function mergeFeeds(priorFeeds: PIResponseFeed[], newFeeds: PIResponseFeed[]): PIResponseFeed[] {
  const skipFeeds: PIResponseFeed[] = []
  const combinedFeeds: PIResponseFeed[] = []
  // console.log("priorFeeds", priorFeeds)
  // console.log("newFeeds", newFeeds)
  priorFeeds.forEach((priorFeed) => {
    // console.log("Checking priorFeed", priorFeed.url, priorFeed.originalUrl, "to existing feeds.")
    const priorFeedURL = getURL(priorFeed.url)?.toString()
    const priorFeedOriginalURL = getURL(priorFeed.originalUrl)?.toString()
    const newFeed = newFeeds.find((newFeedTemp) => {
      const newFeedTempURL = getURL(newFeedTemp.url)?.toString()
      const newFeedTempOriginalURL = getURL(newFeedTemp.originalUrl)?.toString()
      return (
        priorFeed.title === newFeedTemp.title &&
        (
          priorFeedURL === newFeedTempURL ||
          priorFeedURL === newFeedTempOriginalURL
        )
      )
    })
    if (newFeed) {
      // console.log("    found new feed", newFeed?.title, newFeed?.url, newFeed?.originalUrl)
      const newFeedURL = getURL(newFeed.url)?.toString()
      const newFeedOriginalURL = getURL(newFeed.originalUrl)?.toString()
      skipFeeds.push(newFeed)
      // matches
      combinedFeeds.push({
        ...priorFeed,
        ...newFeed,
        source: priorFeed.source,
        url: priorFeedURL === newFeedURL ? priorFeed.url : newFeed.url,
        originalUrl: priorFeedOriginalURL === newFeedOriginalURL ? priorFeed.originalUrl : newFeed.originalUrl
      })
    } else {
      // console.log("using prior feed", priorFeed?.title, priorFeed?.url, priorFeed?.originalUrl)
      combinedFeeds.push(priorFeed)
    }
  })

  newFeeds.forEach((newFeed) => {
    if (!skipFeeds.includes(newFeed)) {
      combinedFeeds.push(newFeed)
    }
  })

  return combinedFeeds
}

export function updateFeeds(feeds: PIResponseFeed[]) {
  if (!IS_BROWSER) return

  const currentFeeds = getFeeds()
  localStorage.setItem(FEEDS, JSON.stringify(mergeFeeds(currentFeeds, feeds)))
}

export function saveTempFeeds(feeds: PIResponseFeed[]) {
  if (!IS_BROWSER) return

  localStorage.setItem(TEMP_FEEDS, JSON.stringify(feeds))
}

export function getFeeds(temp: boolean = false): PIResponseFeed[] {
  if (!IS_BROWSER) return []

  const name = temp ? TEMP_FEEDS : FEEDS
  const currentFeedsString = localStorage.getItem(name)
  if (currentFeedsString === null || currentFeedsString === "") {
    return []
  }

  try {
    const currentFeeds = JSON.parse(currentFeedsString) as PIResponseFeed[]
    if (currentFeeds === null) {
      return []
    }
    return currentFeeds
  } catch {
    return []
  }
}

export function deleteFeeds(prompt = true, temp = false): boolean {
  let doDelete = true
  if (!IS_BROWSER) return doDelete

  if (prompt) {
    doDelete = confirm("Delete all saved feeds?")
  }
  if (doDelete) {
    const name = temp ? TEMP_FEEDS : FEEDS
    localStorage.removeItem(name)
  }
  return doDelete
}

export function getServerUrls(): string[] {
  if (!IS_BROWSER) return []

  const currentServerUrlsString = localStorage.getItem(SERVER_URLS)
  if (currentServerUrlsString === null || currentServerUrlsString === "") {
    return []
  }

  try {
    const currentServerUrls = JSON.parse(currentServerUrlsString) as string[]
    return currentServerUrls || []
  } catch {
    return []
  }
}

export function getTempServerUrl(): string {
  if (!IS_BROWSER) return ""

  return localStorage.getItem(TEMP_SERVER_URL) || ""
}

export function setTempServerUrl(url: string = ""): void {
  if (!IS_BROWSER) return

  return localStorage.setItem(TEMP_SERVER_URL, url)
}

export function updateServerUrls(urls: string[]) {
  if (!IS_BROWSER) return

  const currentServerUrls = getServerUrls()
  urls.forEach((url) => {
    if (!currentServerUrls.includes(url)) {
      currentServerUrls.push(url)
    }
  })
  localStorage.setItem(SERVER_URLS, JSON.stringify(currentServerUrls))
}

export function deleteServerUrls(): boolean {
  if (!IS_BROWSER) return true

  const doDelete = confirm("Delete all saved server URLs?")
  if (doDelete) {
    localStorage.removeItem(SERVER_URLS)
    localStorage.removeItem(TEMP_SERVER_URL)
  }
  return doDelete
}

export function getTheme(): string {
  if (!IS_BROWSER) return "dark"

  let theme = localStorage.getItem(THEME) || "auto"
  theme = theme.toLowerCase()

  if (!ThemeOption.includes(theme)) {
    theme = "auto"
  }

  return theme
}

export function setTheme(theme: string): void {
  if (!IS_BROWSER) return

  return localStorage.setItem(THEME, theme)
}
