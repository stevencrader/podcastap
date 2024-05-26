export type FeedSource = "file" | "search" | "account"

export interface PIResponseFeed {
  id?: number
  title: string
  url: string
  originalUrl: string
  link?: string
  description?: string
  author?: string
  image?: string
  artwork?: string
  podcastGuid?: string
  generator?: string
  itunesId?: string
  // special values used only in PodcastAP
  fromIndex: boolean
  source: FeedSource
  native: boolean // indicates feed is Fediverse native and should be used instead of bridge
}

export interface PIResponse {
  status: "true" | "false"
  feed?: PIResponseFeed
  feeds?: PIResponseFeed[]
}

export interface RequestResult {
  success: boolean
  statusCode: number
  feed?: PIResponseFeed
  feeds?: PIResponseFeed[]
  errorMessage?: string
}

export type PIHeaders = HeadersInit & {
  Authorization: string
  "X-Auth-Date": string
  "X-Auth-Key": string
  "User-Agent": string
}
