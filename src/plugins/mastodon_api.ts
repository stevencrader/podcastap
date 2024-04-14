import { getCookieName, isHttps } from "$deno_kv_oauth/lib/_http.ts"
import { STATUS_CODE, StatusCode } from "@std/http"
import { getCookies } from "@std/http/cookie"
import LinkHeader from "http-link-header"
import { Account, Application, MastodonError, Relationship } from "../types/MastodonAPI.ts"
import { DBServer } from "./db.ts"
import { TOKEN_COOKIE_NAME } from "./kv_oauth.ts"

export async function createApp(serverData: DBServer, redirectUri: string, scope: string): Promise<DBServer | null> {
  const formData = new FormData()
  formData.append("client_name", "PodcastAP")
  formData.append("redirect_uris", redirectUri)
  formData.append("scopes", scope)

  const response = await fetch(
    `${serverData.url}/api/v1/apps`,
    {
      method: "post",
      headers: {},
      body: formData
    }
  )
  if (response.ok) {
    const data = await response.json() as Application
    serverData.clientSecret = data.client_secret || ""
    serverData.clientId = data.client_id || ""
  } else {
    console.error("Unable to create app", response.status, response.statusText)
    return null
  }
  return serverData
}

export function getToken(req: Request): string | undefined {
  const cookies = getCookies(req.headers)
  const cookieName = getCookieName(TOKEN_COOKIE_NAME, isHttps(req.url))
  return cookies[cookieName]
}

async function runAPI(
  method: string,
  token: string | undefined,
  server: string,
  apiPath: string,
  params?: URLSearchParams
): Promise<{
  success: boolean
  status: StatusCode
  data?: unknown
  linkHeader?: LinkHeader
  error?: MastodonError
}> {
  if (token === undefined) {
    return {
      success: false,
      status: STATUS_CODE.InternalServerError,
      data: undefined,
      error: { error: "Unable to get access token" }
    }
  }

  const requestUrl = new URL(apiPath, server)

  if (params) {
    for (const [key, value] of params.entries()) {
      requestUrl.searchParams.append(key, value)
    }
  }
  // console.log(`MAPI: ${method.toUpperCase()} ${requestUrl.toString()}`)
  const response = await fetch(
    requestUrl,
    {
      method: method,
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json"
      }
    }
  )
  const responseHeaders = response.headers
  const link = responseHeaders.get("Link")
  let linkHeader = undefined
  if (link) {
    linkHeader = LinkHeader.parse(link)
  }
  const success = response.ok
  const data = await response.json()
  return {
    success,
    status: response.status as StatusCode,
    data: success ? data : undefined,
    linkHeader,
    error: success ? undefined : data
  }
}

async function runAPIGet(
  token: string | undefined,
  server: string,
  apiPath: string,
  params?: URLSearchParams
): Promise<{
  success: boolean
  status: StatusCode
  data?: unknown
  linkHeader?: LinkHeader
  error?: MastodonError
}> {
  return await runAPI("get", token, server, apiPath, params)
}

async function runAPIPost(
  token: string | undefined,
  server: string,
  apiPath: string,
  params?: URLSearchParams
): Promise<{
  success: boolean
  status: StatusCode
  data?: unknown
  linkHeader?: LinkHeader
  error?: MastodonError
}> {
  return await runAPI("post", token, server, apiPath, params)
}

export async function verifyCredentials(token: string | undefined, server: string): Promise<{
  success: boolean
  status: StatusCode
  user?: Account
  error?: MastodonError
}> {
  const result = await runAPIGet(token, server, "/api/v1/accounts/verify_credentials")
  return {
    success: result.success,
    status: result.status,
    user: result.data as Account,
    error: result.error
  }
}

export async function getFollowing(token: string | undefined, server: string, user: Account): Promise<{
  success: boolean
  status: StatusCode
  following?: Account[]
  error?: MastodonError
}> {
  const overallResult: {
    success: boolean
    status: StatusCode
    following: Account[]
    error?: MastodonError
  } = {
    success: true,
    status: STATUS_CODE.OK,
    following: [],
    error: undefined
  }

  let requestCount = 0
  const maxRequests = 4
  let apiPath = `/api/v1/accounts/${user.id}/following`
  let params: URLSearchParams | undefined = new URLSearchParams({ limit: "80" })
  while (overallResult.success || requestCount < maxRequests) {
    requestCount++
    const result = await runAPIGet(token, server, apiPath, params)
    overallResult.success = result.success
    overallResult.status = result.status
    overallResult.error = result.error

    if (result.success) {
      params = undefined
      const data = result.data as Account[]
      if (data) {
        overallResult.following.push(...data)
      }
      if (result.linkHeader === undefined) {
        break
      }
      const nextLink = result.linkHeader.get("rel", "next") as {
        uri: string
        rel: string
      }[]

      if (nextLink !== undefined && nextLink.length > 0) {
        apiPath = nextLink[0].uri.replace(server, "")
      } else {
        break
      }
    }
  }

  return {
    success: overallResult.success,
    status: overallResult.status,
    following: overallResult.following,
    error: overallResult.error
  }
}

export async function searchAccount(
  token: string | undefined,
  server: string,
  searchTerm: string,
  resolve: boolean
): Promise<{
  success: boolean
  status: StatusCode
  results?: Account[]
  error?: MastodonError
}> {
  const params: URLSearchParams = new URLSearchParams({
    q: searchTerm,
    limit: "1",
    resolve: resolve.toString()
  })
  const result = await runAPIGet(token, server, `/api/v1/accounts/search`, params)
  return {
    success: result.success,
    status: result.status,
    results: result?.data as Account[],
    error: result.error
  }
}

export async function searchAndVerifyAccount(
  token: string | undefined,
  server: string,
  searchTerm: string,
  username: string,
  resolve: boolean
): Promise<{
  success: boolean
  status: StatusCode
  account?: Account
  error?: MastodonError
}> {
  const result = await searchAccount(token, server, searchTerm, resolve)
  if (!result.success || result.results === undefined || result.results.length === 0) {
    return {
      success: result.success,
      status: result.status,
      error: result.error
    }
  }

  // verify result is for username
  // for accounts that are not known to server, other result may be returned
  const matchingAccount = result.results.find((account) => account.acct === username)
  if (matchingAccount === undefined) {
    return {
      success: false,
      status: STATUS_CODE.ServiceUnavailable,
      error: {
        error: "No matching account found"
      }
    }
  }

  return {
    success: true,
    status: STATUS_CODE.OK,
    account: matchingAccount
  }
}

export async function getRelationship(token: string | undefined, server: string, ids: string[]): Promise<{
  success: boolean
  status: StatusCode
  results?: Relationship[]
  error?: MastodonError
}> {
  const params: URLSearchParams = new URLSearchParams()
  ids.forEach((id) => params.append("id[]", id))
  const result = await runAPIGet(token, server, `/api/v1/accounts/relationships`, params)
  return {
    success: result.success,
    status: result.status,
    results: result?.data as Relationship[],
    error: result.error
  }
}

export async function followAccount(token: string | undefined, server: string, id: string): Promise<{
  success: boolean
  status: StatusCode
  relationship?: Relationship
  error?: MastodonError
}> {
  const result = await runAPIPost(token, server, `/api/v1/accounts/${id}/follow`)
  return {
    success: result.success,
    status: result.status,
    relationship: result?.data as Relationship,
    error: result.error
  }
}

export async function unfollowAccount(token: string | undefined, server: string, id: string): Promise<{
  success: boolean
  status: StatusCode
  relationship?: Relationship
  error?: MastodonError
}> {
  const result = await runAPIPost(token, server, `/api/v1/accounts/${id}/unfollow`)
  return {
    success: result.success,
    status: result.status,
    relationship: result?.data as Relationship,
    error: result.error
  }
}
