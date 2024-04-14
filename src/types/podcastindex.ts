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
  guid?: string
  fromIndex: boolean
  source: FeedSource
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
