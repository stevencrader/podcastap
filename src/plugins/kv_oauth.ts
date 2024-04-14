import { COOKIE_BASE, getCookieName, isHttps, OAUTH_COOKIE_NAME, SITE_COOKIE_NAME } from "$deno_kv_oauth/lib/_http.ts"
import { OAuth2ClientConfig } from "$deno_kv_oauth/mod.ts"
import { Cookie, deleteCookie, getCookies } from "@std/http/cookie"
import { Account } from "../types/MastodonAPI.ts"
import { getURL } from "../utils/url.ts"
import { getRequiredEnv } from "../utils/utils.ts"
import checkIfAP from "./check_ap.ts"
import { createMastodonOAuthConfig } from "./create_mastodon_oauth_config.ts"
import { addServerInfo, DBServer, getServer } from "./db.ts"
import { createApp, getToken, verifyCredentials } from "./mastodon_api.ts"

const SERVER_URL = getRequiredEnv("SERVER_URL")

export const TOKEN_COOKIE_NAME = "oauth-token"
export const SERVER_COOKIE_NAME = "active-server"

export function getActiveServer(req: Request): string | undefined {
  const cookies = getCookies(req.headers)
  return cookies[SERVER_COOKIE_NAME]
}

async function getServerData(server: string): Promise<DBServer | null> {
  const url = getURL(server)
  if (url === null) {
    return null
  }

  return await getServer(server)
}

export async function getOAuthConfig(server: string): Promise<OAuth2ClientConfig> {
  let updateServerData = false
  console.log("Getting server", server)
  let serverData = await getServerData(server)
  if (serverData === null) {
    throw new Error(`Unable to get server data for server ${server}`)
  }

  if (serverData.serverType === undefined || serverData.serverType === "") {
    const apServer = await checkIfAP(serverData.url)
    if (!apServer.valid) {
      throw new Error(`Server ${server} is not a supported Activity Pub server`)
    }
    serverData.serverType = apServer.name
    updateServerData = true
  }

  const redirectUrl = new URL("/auth/callback", SERVER_URL)
  const redirectUri = redirectUrl.toString()
  const scope = "read:accounts read:follows read:search write:follows"

  if (
    serverData.clientId === "" || serverData.clientSecret === "" ||
    serverData.clientId === undefined || serverData.clientSecret === undefined
  ) {
    serverData = await createApp(serverData, redirectUri, scope)
    if (serverData === null) {
      throw new Error(`Unable to create an Oauth client on server ${server}`)
    }

    if (
      serverData.clientId === undefined ||
      serverData.clientSecret === undefined
    ) {
      throw new Error(`Unable to create app for server ${server}`)
    }
    updateServerData = true
  }

  if (updateServerData) {
    const result = await addServerInfo(serverData)
    if (!result) {
      throw new Error(`Unable to save server data for ${server}`)
    }
  }

  return createMastodonOAuthConfig(
    serverData.url,
    {
      clientId: serverData.clientId,
      clientSecret: serverData.clientSecret,
      redirectUri,
      scope
    }
  )
}

type VerifyUserReturn = {
  success: boolean
  headers: Headers
  user: Account | undefined
}

export async function verifyUser(req: Request, server: string): Promise<VerifyUserReturn> {
  const cookies = getCookies(req.headers)

  const headers = new Headers()

  deleteCookie(headers, SITE_COOKIE_NAME)

  const sessionId = cookies[SITE_COOKIE_NAME] // site-session
  if (sessionId === undefined) {
    deleteCookie(headers, OAUTH_COOKIE_NAME)
    return { success: false, headers, user: undefined }
  }

  try {
    const oauthToken = getToken(req)
    const credentials = await verifyCredentials(oauthToken, server)
    return {
      success: credentials.success,
      headers: credentials.success ? new Headers() : headers,
      user: credentials.user
    }
  } catch {
    return {
      success: false,
      headers,
      user: undefined
    }
  }
}

export function buildCookie(url: string, name: string, value: string): Cookie {
  return {
    ...COOKIE_BASE,
    name: getCookieName(name, isHttps(url)),
    value: value,
    secure: isHttps(url)
  }
}
